<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EquipmentController;
use Illuminate\Support\Facades\Route;



Route::post('/register',[AuthController::class , 'register'] );

Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth:santcum')->group(function(){

    Route::get('/getMe' , [AuthController::class, 'getMe']);

    Route::get('/logout', [AuthController::class, 'logout']);


    
    Route::get('/equipment',[EquipmentController::class,'index']);
    Route::post('/equipment', [EquipmentController::class, 'store']);
    Route::get('equipment/{equipment}',[EquipmentController::class, 'show']);
    Route::put('/equipment/{equipment}',[EquipmentController::class, 'update']);
    Route::delete('/equipment/{equipment}', [EquipmentController::class,'delete']);

    

    

});