"use server";

import { supabaseAdmin } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveCourse(name: string, layout: any[]) {
  try {
    if (!name || name.trim().length === 0) {
      return { error: "El nombre es obligatorio." };
    }
    if (!layout || layout.length === 0) {
      return { error: "El circuito debe tener al menos una puerta." };
    }

    // En un futuro, aquí podríamos obtener el ID del usuario real
    const authorName = "Invitado"; 

    const { error } = await supabaseAdmin
      .from('SlalomCourse')
      .insert({
        name,
        authorName,
        layout: layout,
      });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/slalom');
    
  } catch (error: any) {
    console.error("Error saving course:", error.message);
    return { error: "Error al guardar el diseño. Inténtalo de nuevo." };
  }

  redirect('/slalom');
}
