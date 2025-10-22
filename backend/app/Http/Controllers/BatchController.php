<?php

namespace App\Http\Controllers;

use App\Models\BatchGroup;
use App\Models\BatchMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BatchController extends Controller
{
    public function index()
    {
        return response()->json(BatchGroup::orderBy('batch_year', 'desc')->get());
    }

    public function show(string $id)
    {
        return response()->json(BatchGroup::findOrFail($id));
    }

    public function messages(string $id)
    {
        return response()->json(
            BatchMessage::where('batch_group_id', $id)
                ->orderBy('created_at')
                ->get()
        );
    }

    public function storeMessage(Request $request, string $id)
    {
        $data = $request->validate([
            'sender_id' => 'required|uuid',
            'message' => 'required|string',
        ]);
        $msg = new BatchMessage([
            'batch_group_id' => $id,
            'sender_id' => $data['sender_id'],
            'message' => $data['message'],
        ]);
        $msg->id = (string) Str::uuid();
        $msg->save();
        return response()->json($msg, 201);
    }
}


