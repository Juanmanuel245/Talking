import { useEffect, useState, useRef } from "react";
import { AiOutlineSound } from "react-icons/ai";
import { FaWhatsapp } from "react-icons/fa6";

interface Pictografia {
  id: number;
  nombre: string;
}

export default function Home() {
  const [items, setItems] = useState<Pictografia[]>([]);
  const [visibleItems, setVisibleItems] = useState<Pictografia[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // Estado para manejar las pictografías seleccionadas
  const [loadLimit, setLoadLimit] = useState(20); // Cantidad inicial a mostrar
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  console.log(items);

  // Cargar los datos iniciales
  useEffect(() => {
    fetch("/data/items/es.json")
      .then((response) => response.json())
      .then((data) => {
        setItems(data); // Guardar todos los elementos
        setVisibleItems(data.slice(0, loadLimit)); // Mostrar solo los primeros 20
      })
      .catch((error) => console.error("Error al cargar los datos:", error));
  }, [loadLimit]);

  // Manejar el evento de scroll
  const handleScroll = () => {
    const container = scrollContainerRef.current;

    if (container) {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // Verificar si el usuario está cerca del final del contenedor
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setLoadLimit((prevLimit) => prevLimit + 30); // Incrementar el límite de carga
      }
    }
  };

  // Añadir y limpiar el listener de scroll
  useEffect(() => {
    const container = scrollContainerRef.current;

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Manejar la selección de pictografías
  const handleSelectItem = (nombre: string) => {
    setSelectedItems((prevSelected) => {
      // Si ya está seleccionado, lo quitamos; de lo contrario, lo añadimos
      if (prevSelected.includes(nombre)) {
        return prevSelected.filter((item) => item !== nombre);
      } else {
        return [...prevSelected, nombre];
      }
    });
  };

  // Manejar el botón de compartir
  const handleShare = () => {
    const message = selectedItems.join(", "); // Crear el mensaje con los nombres seleccionados
    if (message) {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank"); // Abrir WhatsApp en una nueva pestaña
    } else {
      alert("Selecciona al menos una pictografía para compartir.");
    }
  };

  // Manejar el botón de audio (texto a voz)
  const handleSpeak = () => {
    const message = selectedItems.join(", "); // Crear el mensaje con los nombres seleccionados
    if (message) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "es-ES"; // Idioma español
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Selecciona al menos una pictografía para reproducir el audio.");
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Barra Superior */}
      <div className="fixed top-0 left-0 right-0 bg-gray-200 flex items-center justify-between px-4 py-2 shadow-md">
        <div className="flex-1 text-gray-700 text-lg">
          {/* Mostrar las pictografías seleccionadas */}
          <p className="truncate">{selectedItems.join(", ") || "Texto..."}</p>
        </div>
        <div className="flex space-x-2">
          <button
            className="bg-gray-400 text-white p-2 rounded-full shadow hover:bg-gray-500"
            onClick={handleSpeak}
          >
            <AiOutlineSound />
          </button>
          <button
            className="bg-gray-400 text-white p-2 rounded-full shadow hover:bg-gray-500"
            onClick={handleShare}
          >
            <FaWhatsapp />
          </button>
        </div>
      </div>

      {/* Espacio para los botones del medio */}
      <div
        ref={scrollContainerRef}
        className="flex-grow mt-16 mb-16 grid grid-cols-3 gap-4 p-4 overflow-auto"
      >
        {visibleItems.map((item) => (
          <button
            key={item.id}
            className={`bg-white border rounded-lg shadow p-4 flex items-center justify-center text-center ${
              selectedItems.includes(item.nombre) ? "bg-blue-200" : ""
            }`}
            onClick={() => handleSelectItem(item.nombre)}
          >
            <div className="text-sm">
              <img
                src={`/data/imagenes/${item.id}_500.png`}
                alt={`Pictograma ${item.id}`}
                className="mx-auto mb-2"
              />
              <p>{item.nombre}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Barra Inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-200 shadow-md">
        <div className="flex justify-center items-center px-4 py-2">
          <p className="text-lg font-semibold text-blue-600">
            Talking - 2025 - <span className="italic">Version Alpha 0.1</span>
          </p>
        </div>
      </div>
    </div>
  );
}
