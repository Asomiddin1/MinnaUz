<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    /**
     * Barcha modullarni ko'rsatish
     */
    public function index(Request $request)
    {
        // Admin panelda qaysi darajaga (level) tegishli ekanini ko'rish uchun "level" bilan olamiz
        $query = Module::with('level')->withCount('lessons');

        // Agar admin faqat bitta levelning modullarini ko'rmoqchi bo'lsa (URL: ?level_id=1)
        if ($request->has('level_id')) {
            $query->where('level_id', $request->level_id);
        }

        // Tartibi bo'yicha chiqarib beramiz
        return response()->json($query->orderBy('order')->get());
    }

    /**
     * Yangi modul qo'shish
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'level_id' => 'required|exists:levels,id',
            'title' => 'required|array',
            'title.uz' => 'required|string|max:255',
            'order' => 'nullable|integer'
        ]);

        // Agar order kiritilmasa, 0 qilib belgilaymiz
        $validated['order'] = $validated['order'] ?? 0;

        $module = Module::create($validated);

        return response()->json([
            'message' => 'Modul muvaffaqiyatli yaratildi!',
            'data' => $module
        ], 201);
    }

    /**
     * Bitta modulni to'liq ko'rish (ichidagi darslari bilan)
     */
    // E'tibor bering: (string $id) o'rniga (Module $module) ishlatdik (Route Model Binding)
    public function show(Module $module) 
    {
        return response()->json($module->load(['level', 'lessons']));
    }

    /**
     * Modulni tahrirlash (Edit)
     */
    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'level_id' => 'required|exists:levels,id',
            'title' => 'required|array',
            'title.uz' => 'required|string|max:255',
            'order' => 'required|integer'
        ]);

        $module->update($validated);

        return response()->json([
            'message' => 'Modul yangilandi!',
            'data' => $module
        ]);
    }

    /**
     * Modulni o'chirish
     */
    public function destroy(Module $module)
    {
        $module->delete();
        
        return response()->json([
            'message' => 'Modul muvaffaqiyatli o\'chirildi!'
        ]);
    }
}