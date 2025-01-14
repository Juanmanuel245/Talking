export interface Pictografia {
    id: number;             // ID of the item
    keywords: string[];     // Array of keywords
    favorito: boolean;      // Boolean flag for favorite
    usos: number;           // Usage count
    idcategoria: null | number; // Optional category ID (null or number)
}