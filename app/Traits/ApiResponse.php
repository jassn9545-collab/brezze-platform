<?php

namespace App\Traits;

trait ApiResponse
{
    protected function success($data = null, $message = 'Success', $code = 200)
    {
        return response()->json([
            'status'  => 'success',
            'message' => $message,
            'data'    => $data,
        ], $code);
    }

    protected function error($message = 'Something went wrong', $code = 400, $errors = null)
    {
        return response()->json([
            'status'  => 'failed',
            'message' => $message,
            'errors'  => $errors,
        ], $code);
    }
}