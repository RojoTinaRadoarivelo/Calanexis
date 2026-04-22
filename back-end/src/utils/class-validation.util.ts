export function verifyObject<T>(
  obj: any,
  clazz: new (...args: any) => T,
): boolean {
  // Créer une instance de la classe
  const instance = new clazz({});

  // Récupérer les noms des getters
  const instanceKeys = Object.getOwnPropertyNames(
    Object.getPrototypeOf(instance),
  ).filter((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(instance),
      key,
    );
    return descriptor && typeof descriptor.get === 'function';
  });

  // Comparer avec les clés de l'objet fourni
  const objKeys = Object.keys(obj);

  return instanceKeys.every((key) => objKeys.some((el) => el.includes(key)));
}
