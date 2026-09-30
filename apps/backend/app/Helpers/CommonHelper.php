<?php

namespace App\Helpers;
use DB;
class CommonHelper
{
    public static function get_setting()
    {
        return DB::table('settings')->pluck('value', 'key')->toArray();
    }
}