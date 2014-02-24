<?php

use Buzz\Message\Request;

return array(
    'timeout'           => 5000,
    'verifyPeer'        => false,
    'allowedMethods'    => array(
        Request::METHOD_GET,
        Request::METHOD_POST,
        Request::METHOD_DELETE,
        Request::METHOD_PUT,
        Request::METHOD_OPTIONS,
        Request::METHOD_PATCH
    )
);