<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\EquipmentRequest;
use App\Models\Equipment;
use Illuminate\Http\Request;

class EquipmentController extends Controller
{

    public function index (Request $request){

        $companyId = $request->user()->company_id;

        $equipments = Equipment::where('company_id', $companyId)
            ->orderBy('name','desc')
            ->get();

            return response()->json($equipments);
    }

    public function store(EquipmentRequest $request){

        $companyId = $request->user()->company_id;

        $data = $request->validated();

        $equipment = Equipment::create([
            ...$data,
            'company_id' => $companyId,
        ]);
        
        return response()->json($equipment,201);



    }

    public function show(Request $request, Equipment $equipment){
        
       
        $this->assertSameCompany($request, $equipment);
        

        return response()->json($equipment);

    }


    public function update(EquipmentRequest $request, Equipment $equipment){

        $this->assertSameCompany($request, $equipment);

        $equipment->update($request->validated());

        return response()->json($equipment);

    }


    public function destroy(Request $request, Equipment $equipment){
        $this->assertSameCompany($request, $equipment);

        $equipment->delete();

        return response()->json([ 'message' => 'Deleted.']);

    }



    private function assertSameCompany(Request $request, Equipment $equipment): void{

        if ($equipment->company_id !== $request->user()->company_id){
            abort(404);
        }
    }

}

