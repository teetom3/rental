<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Requests\Api\LoginRequest;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(RegisterRequest $request) {
        
        $data = $request->validated();

        $company = ([
            'name' => $data['company_name'],
            'slug' => Str::slug($data['company_name']) . '-' . Str::lower(Str::random(6)),
        ]);

        $user = ([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'company_id' => $company->id,
            'role' => 'admin',
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'company' => $company
        ],201);
    }


    public function Login (LoginRequest $request) {

        $data = $request->validated();

        $user = User::find('email', $data['email'])->first();

       if (! $user || ! Hash::check($data['password'], $user->password)) {

            return response()->json([
                'message' => 'Invalid credentials.',
            ],422);
        }
                $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token'   => $token,
            'user'    => $user,
            'company' => $user->company, // requires relation in User model
        ]);


    }



    public function getMe(Request $request){

        $user = $request()->user();

        return response()->json([
            'user'=> $user,
            'company'=> $user?->company

        ]);
    }

    public function logout(Request $request){

        $user = $request()->user();

        $user->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'loged out.'
        ]);


    }
}
