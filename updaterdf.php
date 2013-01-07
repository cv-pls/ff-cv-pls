<?php

  function make_der_length($str) {
    $len = strlen($str);
    if ($len < 128) {
      return chr($len);
    } else {
      $len = ltrim(pack('N', $len), "\x00");
      return chr(strlen($len) | 0x80).$len;
    }
  }

  $w3nsUrl = 'http://www.w3.org/2000/xmlns/';
  $rdfUrl = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
  $emUrl = 'http://www.mozilla.org/2004/em-rdf#';
  $firefoxGUID = '{ec8030f7-c20a-464f-9b0e-13a3a9e97384}';

  $extnGUID = 'cv-pls@stackoverflow.com';

  $doc = new DOMDocument('1.0', 'utf-8');
  $doc->formatOutput = true;

  $rootEl = $doc->createElementNS($rdfUrl, 'RDF:RDF');
  $rootEl->setAttributeNS($w3nsUrl, 'xmlns:em', $emUrl);
  $doc->appendChild($rootEl);

  $containerEl = $doc->createElementNS($rdfUrl, 'RDF:Description');
  $containerEl->setAttribute('about', 'urn:mozilla:extension:'.$extnGUID);
  $rootEl->appendChild($containerEl);

  $updatesEl = $doc->createElementNS($emUrl, 'em:updates');
  $containerEl->appendChild($updatesEl);

  $seqEl = $doc->createElementNS($rdfUrl, 'RDF:Seq');
  $updatesEl->appendChild($seqEl);

// version loop would start here

  $version = '0.21.0';
  $xpiPath = "cv-pls_$version.xpi";
  $updateLink = "http://cv-pls.dev/$xpiPath";
  $updateInfoURL = "http://cv-pls.dev/updateinfo.php?version=$version";
  $minVersion = '4.0';
  $maxVersion = '20.*';
  $hashAlgo = 'sha512';

  $hash = hash_file($hashAlgo, $xpiPath);
  $updateHash = "$hashAlgo:$hash";

  $liEl = $doc->createElementNS($rdfUrl, 'RDF:li');
  $seqEl->appendChild($liEl);
  $itemEl = $doc->createElementNS($rdfUrl, 'RDF:Description');
  $itemEl->setAttribute('about', 'urn:mozilla:extension:'.$extnGUID.':'.$version);
  $liEl->appendChild($itemEl);

  $targetAppEl = $doc->createElementNS($emUrl, 'em:targetApplication');
  $itemEl->appendChild($targetAppEl);
  $appContainerEl = $doc->createElementNS($rdfUrl, 'RDF:Description');
  $targetAppEl->appendChild($appContainerEl);

  $els = array(
    'id' => $firefoxGUID,
    'minVersion' => $minVersion,
    'maxVersion' => $maxVersion,
    'updateHash' => $updateHash,
    'updateInfoURL' => $updateInfoURL,
    'updateLink' => $updateLink
  );

  ksort($els); // MUST be alphabetical order!
  foreach ($els as $el => $data) {
    $el = $doc->createElementNS($emUrl, "em:$el", $data);
    $appContainerEl->appendChild($el);
  }

  $versionEl = $doc->createElementNS($emUrl, 'em:version', $version);
  $itemEl->appendChild($versionEl);

// version loop would end here

// Sign the file
  if (!defined('OPENSSL_ALGO_SHA512')) {
    define('OPENSSL_ALGO_SHA512', 9);
  }
  $algoIds = array(
    OPENSSL_ALGO_SHA1   => "\x30\x0d\x06\x09\x2a\x86\x48\x86\xf7\x0d\x01\x01\x05\x05\x00",
    OPENSSL_ALGO_SHA512 => "\x30\x0d\x06\x09\x2a\x86\x48\x86\xf7\x0d\x01\x01\x0d\x05\x00"
  );

  $signAlgo = OPENSSL_ALGO_SHA1;
  $signTarget = $doc->saveXML($containerEl)."\n";
//  echo $signTarget;
  $pemFile = 'ff-cv-pls.pem';
  $privateKey = openssl_pkey_get_private("file://$pemFile");
  openssl_sign($signTarget, $signature, $privateKey, $signAlgo);

  $signature = "\x03".make_der_length($signature).$signature;

  $data = $algoIds[$signAlgo].$signature;
  $length = make_der_length($data);

// Add the sig to the file
  $signatureEl = $doc->createElementNS($emUrl, 'em:signature', base64_encode("\x30".$length.$data));
  $containerEl->appendChild($signatureEl);

// Save the file
  $doc->save('update.rdf');