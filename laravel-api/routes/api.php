<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\EquipmentController;
use Illuminate\Support\Facades\Route;



Route::post('/register',[AuthController::class , 'register'] );

Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth:sanctum')->group(function(){

    Route::get('/getMe' , [AuthController::class, 'getMe']);

    Route::get('/logout', [AuthController::class, 'logout']);


    
    Route::get('/equipment',[EquipmentController::class,'index']);
    Route::post('/equipment', [EquipmentController::class, 'store']);
    Route::get('equipment/{equipment}',[EquipmentController::class, 'show']);
    Route::put('/equipment/{equipment}',[EquipmentController::class, 'update']);
    Route::delete('/equipment/{equipment}', [EquipmentController::class,'delete']);

    // Routes pour les réservations (Bookings)
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::post('/bookings/check-availability', [BookingController::class, 'checkAvailability']);
    Route::patch('/bookings/{id}/complete', [BookingController::class, 'markAsCompleted']);
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);

});