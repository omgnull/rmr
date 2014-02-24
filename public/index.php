<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Buzz\Client\Curl;
use Buzz\Message\Request as BuzzRequest;
use Buzz\Message\Response as BuzzResponse;

// Autoload
require_once __DIR__.'/../vendor/autoload.php';

// Config file
$config = require_once __DIR__ .'/../app/config.php';

// App initialize
$app = new \Silex\Application();

// Router
$app->post('/api', function(Request $request) use ($app, $config) {
    if (!$request->isXmlHttpRequest()) {
        return new Response('Not found.', 404);
    }

    // Get all params
    $method     = $request->get('method');
    $url        = $request->get('url');
    $params     = $request->get('params');
    $values     = $request->get('values');

    $parameters = array();

    // Validate url
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return $app->json(array(
            'message' => 'Url invalid.'
        ));
    }

    // Validate method
    if (!in_array($method, $config['allowedMethods'], true)) {
        return $app->json(array(
            'message' => 'Method invalid.'
        ));
    }

    // Get all request parameters
    if (is_array($params) && is_array($values)) {
        foreach ($params as $i => &$name) {

            // Remove duplicates
            if (isset($parameters[$name])) {
                continue;
            }

            // Check name is provided
            if (!is_scalar($name) || '' === trim($name)) {
                continue;
            }

            $value = & $values[$i];

            // Check value is exists
            if (isset($value) && is_scalar($value) && '' !== trim($value)) {
                $parameters[$name] = $value;
            }
        }
    }

    // Api request message
    $apiRequest  = new BuzzRequest($method, $url);
    $apiResponse = new BuzzResponse();

    // Set query parameters to the request
    if (in_array($apiRequest->getMethod(), array(BuzzRequest::METHOD_GET))) {
        if ($parameters) {
            $apiRequest->setResource($url . '?' . http_build_query($parameters));
        }
    } else {
        $apiRequest->setContent($parameters);
    }

    $client = new Curl();
    $client->setTimeout($config['timeout']);
    $client->setVerifyPeer($config['verifyPeer']);

    try {

        // Send api request
        $client->send($apiRequest, $apiResponse, array(
            CURLINFO_HEADER_OUT => true
        ));

        // Request headers
        $requestHeaders = array();
        foreach (preg_split('/(\\r?\\n)/', $client->getInfo(CURLINFO_HEADER_OUT)) as $header) {
            if ($header) {
                $requestHeaders[] = $header;
            } else {
                continue;
            }
        }

        // Full response
        return $app->json(array(
            'request'   => array(
                'headers'   => $requestHeaders,
                'body'      => (BuzzRequest::METHOD_GET !== $apiRequest->getMethod() ? $parameters : null)
            ),
            'response'  => array(
                'headers'   => $apiResponse->getHeaders(),
                'body'      => $apiResponse->getContent()
            )
        ));

    } catch (\Buzz\Exception\ClientException $e) {
        return $app->json(array(
            'message' => $e->getMessage()
        ));
    }
});
$app->error(function (\Exception $e, $code) {
    return new Response('Not found. ' .$e->getMessage(), 404);
});

// Handle request
$app->run();