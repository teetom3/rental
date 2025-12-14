<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;



Route::post('/register',[AuthController::class , 'register'] );

Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth:santcum')->group(function(){

    Route::get('/getMe' , [AuthController::class, 'getMe']);

    Route::get('/logout', [AuthController::class, 'logout']);

});