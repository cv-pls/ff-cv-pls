<?php

  class FirefoxUpdateRDF {

    // Namespace URIs. These will most likely never change.
    protected $w3nsUrl = 'http://www.w3.org/2000/xmlns/';
    protected $rdfUrl = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
    protected $emUrl = 'http://www.mozilla.org/2004/em-rdf#';

    // GUID of the Firefox application
    protected $firefoxGUID = '{ec8030f7-c20a-464f-9b0e-13a3a9e97384}';

    // Default values for version keys
    protected $versionDefaults = array(
      'minVersion' => '4.0', // 4 is the first version where this update.rdf format is applicable
      'maxVersion' => '99.*' // An arbitrary version a long way in the future
    );

    // Variable to hold our DOMDocument instance
    protected $document;

    // Shortcut references to useful elements
    protected $rootEl;
    protected $containerEl;
    protected $seqEl;

    // The hashing algorithm used for creating the XPI signature
    protected $hashAlgo = 'sha512';

    // Cache generated XPI signatures to avoid generating the same signature twice
    private $hashCache = array();

    // An OpenSSL private key resource
    protected $privateKey;

    // Meta data about the extension
    protected $extnGUID;
    protected $versions = array();

    public function setHashAlgo($algo) {
      $this->hashAlgo = $algo;
    }
    public function getHashAlgo($algo) {
      return $this->hashAlgo;
    }

    public function setExtnGUID($guid) {
      $this->extnGUID = $guid;
    }
    public function getExtnGUID($guid) {
      return $this->extnGUID;
    }

    public function loadPrivateKey($key, $passphrase = '') {
      if (!$this->privateKey = openssl_pkey_get_private($key, $passphrase)) {
        throw new \InvalidArgumentException('Unable to load the specified private key');
      }
    }
    public function freePrivateKey() {
      if ($this->privateKey) {
        openssl_free_key($this->privateKey);
        $this->privateKey = NULL;
      }
    }

    public function addVersion(array $info) {
      if (!isset($info['version'], $info['updateLink']) || (!isset($info['xpiPath']) && !isset($info['updateHash']))) {
        throw new \InvalidArgumentException('Invalid version info, required keys: version, updateLink and at least one of xpiPath, updateHash');
      } else if (!isset($info['updateHash']) && (!is_file($info['xpiPath']) || !is_readable($info['xpiPath']))) {
        throw new \InvalidArgumentException('Invalid path for local XPI file: file does not exist or is not readable');
      }

      $version = $info['version'];
      $info['id'] = $this->firefoxGUID;

      if (!isset($info['updateHash'])) {
        $info['updateHash'] = $this->getFileHash($info['xpiPath']);
      }

      unset($info['version'], $info['xpiPath']);

      $this->versions[$version] = array_merge($this->versionDefaults, $info);
    }
    public function removeVersion($version) {
      unset($this->versions[$version]);
    }
    public function getVersions() {
      return $this->versions;
    }

    public function generateRDF($outfile = NULL) {
      if (!isset($this->extnGUID)) {
        throw new \RuntimeException('Cannot generate RDF without an extension GUID');
      } else if (!$this->versions) {
        throw new \RuntimeException('Cannot generate RDF without at least one update version');
      } else if (!$this->privateKey) {
        throw new \RuntimeException('Cannot generate RDF without private key for signature');
      }

      if ($outfile !== NULL) {
        if (!$fp = @fopen($outfile, 'a')) {
          throw new \InvalidArgumentException('The supplied file path is not writable');
        }
        fclose($fp);
      }

      $this->initialiseDocument();
      $this->createRDFContainer();
      $this->createRDFVersions();
      $this->signManifest();

      $result = $this->document->saveXML();

      $this->resetObjectProperties();

      if ($outfile !== NULL) {
        return file_put_contents($outfile, $result);
      } else {
        return $result;
      }
    }

    protected function initialiseDocument() {
      $this->document = new DOMDocument('1.0', 'utf-8');
      $this->document->formatOutput = true;

      $this->rootEl = $this->document->createElementNS($this->rdfUrl, 'RDF:RDF');
      $this->rootEl->setAttributeNS($this->w3nsUrl, 'xmlns:em', $this->emUrl);
      $this->document->appendChild($this->rootEl);
    }

    protected function createRDFContainer() {
      $this->containerEl = $this->document->createElementNS($this->rdfUrl, 'RDF:Description');
      $this->containerEl->setAttribute('about', 'urn:mozilla:extension:'.$this->extnGUID);
      $this->rootEl->appendChild($this->containerEl);

      $updatesEl = $this->document->createElementNS($this->emUrl, 'em:updates');
      $this->containerEl->appendChild($updatesEl);

      $this->seqEl = $this->document->createElementNS($this->rdfUrl, 'RDF:Seq');
      $updatesEl->appendChild($this->seqEl);
    }

    protected function createRDFVersions() {
      foreach ($this->versions as $version => $info) {
        $this->createRDFVersion($version, $info);
      }
    }
    protected function createRDFVersion($version, $info) {
      list($itemEl, $appContainerEl) = $this->createRDFVersionContainer($version);

      ksort($info); // MUST be alphabetical order!
      foreach ($info as $tagName => $data) {
        $appContainerEl->appendChild($this->document->createElementNS($this->emUrl, "em:$tagName", htmlspecialchars($data)));
      }

      $versionEl = $this->document->createElementNS($this->emUrl, 'em:version', $version);
      $itemEl->appendChild($versionEl);
    }
    protected function createRDFVersionContainer($version) {
      $liEl = $this->document->createElementNS($this->rdfUrl, 'RDF:li');
      $this->seqEl->appendChild($liEl);
      $itemEl = $this->document->createElementNS($this->rdfUrl, 'RDF:Description');
      $itemEl->setAttribute('about', 'urn:mozilla:extension:'.$this->extnGUID.':'.$version);
      $liEl->appendChild($itemEl);

      $targetAppEl = $this->document->createElementNS($this->emUrl, 'em:targetApplication');
      $itemEl->appendChild($targetAppEl);
      $appContainerEl = $this->document->createElementNS($this->rdfUrl, 'RDF:Description');
      $targetAppEl->appendChild($appContainerEl);

      return array($itemEl, $appContainerEl);
    }

    protected function signManifest() {
      $signatureTarget = $this->document->saveXML($this->containerEl)."\n";
      $signature = $this->generateSignature($signatureTarget);
      $signatureEl = $this->document->createElementNS($this->emUrl, 'em:signature', $signature);
      $this->containerEl->appendChild($signatureEl);
    }
    protected function generateSignature($signatureTarget) {
      // TODO: Add support for other algorithms
      $algo = 'sha512';
      $algoId = "\x0d";

      openssl_sign($signatureTarget, $signature, $this->privateKey, 'sha512');

      // There are some rather interesting standards violations that Mozilla engage in for this.
      // Here is the first of them:
      $signature = "\x00".$signature;

      // Encode as a DER BIT STRING field
      $derSignature = "\x03".$this->getDERLength($signature).$signature;

      // Here is another one
      // The standard states that there should be a NULL short on the end of the SEQUENCE (\x05\x00)
      $derAlgoId = "\x30\x0b\x06\x09\x2a\x86\x48\x86\xf7\x0d\x01\x01".$algoId;

      // Encode as SEQUENCE
      $derData = "\x30".$this->getDERLength($derAlgoId.$derSignature).$derAlgoId.$derSignature;

      return base64_encode($derData);
    }

    final protected function getDERLength($data) {
      $length = strlen($data);
      if ($length < 128) {
        return chr($length);
      } else {
        // Lazy option that limits the data size to 4.3GB - OK for the purposes of this class
        // Theoretically the DER standard allows for a length up to 2^1008
        // TODO: fix this
        $length = ltrim(pack('N', $length), "\x00");
        return chr(strlen($length) | 0x80).$length;
      }
    }

    protected function getFileHash($file) {
      if (!isset($this->hashCache[$file])) {
        $this->hashCache[$file] = $this->hashAlgo.':'.hash_file($this->hashAlgo, $file);
      }
      return $this->hashCache[$file];
    }

    protected function resetObjectProperties() {
      $this->hashCache = array();
      $this->document = $this->rootEl = $this->containerEl = $this->seqEl = NULL;
    }

  }

  $extnGUID = 'cv-pls@stackoverflow.com';

  $version = '0.21.0';
  $localPath = '.';
  $baseURL = 'http://cv-pls.dev';

  $privateKey = 'ff-cv-pls.pem';
  $outFile = 'update.rdf';

  $fileNameFormat = '%s/cv-pls_%s.xpi';
  $infoURLFormat = '%s/updateinfo.php?version=%s';

  $rdf = new FirefoxUpdateRDF;

  $rdf->setExtnGUID($extnGUID);
  $rdf->addVersion(array(
    'version' => $version,
    'xpiPath' => sprintf($fileNameFormat, $localPath, $version),
    'updateLink' => sprintf($fileNameFormat, $baseURL, $version),
    'updateInfoURL' => sprintf($infoURLFormat, $baseURL, $version)
  ));
  $rdf->loadPrivateKey("file://$privateKey");

  $rdf->generateRDF($outFile);
