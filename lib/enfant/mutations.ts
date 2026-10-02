/** A failed save must never be displayed as a successful update. */
export async function saveMutation(operation: PromiseLike<{ error: unknown }>) {
  const { error } = await operation;
  if (error) throw new Error("La modification n’a pas été enregistrée. Vérifie ta connexion et réessaie.");
}
