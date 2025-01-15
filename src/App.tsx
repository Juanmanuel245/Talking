import { useEffect, useState, useRef } from "react";
import { AiOutlineSound } from "react-icons/ai";
import { FaWhatsapp } from "react-icons/fa6";
import { IoClose } from "react-icons/io5"; // Icono de la cruz blanca
import { MdKeyboardArrowRight } from "react-icons/md"; // Icono de flecha

interface Pictografia {
  id: number;
  nombre: string;
  categoria?: string; // Atributo opcional para categorías
}

export default function Home() {
  const [sections, setSections] = useState<Record<string, Pictografia[]>>({});
  const [allItems, setAllItems] = useState<Pictografia[]>([]);
  const [visibleAllItems, setVisibleAllItems] = useState<Pictografia[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]); // Secciones expandidas
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // Estado para manejar las pictografías seleccionadas
  const [loadLimit, setLoadLimit] = useState(21); // Cantidad inicial a mostrar
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Cargar los datos iniciales
  useEffect(() => {
    const sectionFiles = ["alimentos.json", "emociones.json", "fiestas.json", "personas.json"];
    const promises = sectionFiles.map((file) =>
      fetch(`/data/items/${file}`)
        .then((res) => res.json())
        .then((data) => ({ [file.split(".")[0]]: data }))
    );

    // Cargar todos los datos de las secciones
    Promise.all(promises)
      .then((results) => {
        const combinedSections = results.reduce((acc, section) => ({ ...acc, ...section }), {});
        setSections(combinedSections);
      })
      .catch((err) => console.error("Error al cargar secciones:", err));

    // Cargar la sección "Todos" con scroll infinito
    fetch("/data/items/todos.json")
      .then((res) => res.json())
      .then((data) => {
        setAllItems(data);
        setVisibleAllItems(data.slice(0, loadLimit));
      })
      .catch((err) => console.error("Error al cargar todos.json:", err));
  }, []);

  // Manejar el evento de scroll
  const handleScroll = () => {
    const container = scrollContainerRef.current;

    if (container) {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // Verificar si el usuario está cerca del final del contenedor
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setLoadLimit((prevLimit) => {
          const newLimit = prevLimit + 21;
          setVisibleAllItems(allItems.slice(0, newLimit)); // Incrementar elementos visibles
          return newLimit;
        });
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
  }, [allItems]);

  // Manejar la selección de pictografías
  const handleSelectItem = (nombre: string) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(nombre)) {
        return prevSelected.filter((item) => item !== nombre);
      } else {
        return [...prevSelected, nombre];
      }
    });
  };

  // Manejar el botón para expandir una sección
  const handleExpandSection = (sectionName: string) => {
    setExpandedSections((prevExpanded) => {
      if (prevExpanded.includes(sectionName)) {
        return prevExpanded.filter((name) => name !== sectionName);
      } else {
        return [...prevExpanded, sectionName];
      }
    });
  };

  // Manejar el botón de compartir
  const handleShare = () => {
    const message = selectedItems.join(", "); // Crear el mensaje con los nombres seleccionados
    if (message) {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    } else {
      alert("Selecciona al menos una pictografía para compartir.");
    }
  };

  // Manejar el botón de audio (texto a voz)
  const handleSpeak = () => {
    const message = selectedItems.join(", ");
    if (message) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "es-ES";
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Selecciona al menos una pictografía para reproducir el audio.");
    }
  };

  // Manejar el botón para limpiar la selección
  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Barra Superior */}
      <div className="fixed top-0 left-0 right-0 bg-gray-200 px-4 py-2 shadow-md">
        <div className="text-gray-700 text-lg break-words whitespace-pre-wrap">
          <p>{selectedItems.join(", ") || "Selecciona los pictogramas..."}</p>
        </div>
      </div>

      <div className="flex-grow mt-16 mb-16 overflow-auto" ref={scrollContainerRef}>
        {/* Renderizar secciones */}
        {Object.entries(sections).map(([sectionName, items]) => (
          <div key={sectionName} className="p-4">
            <h2 className="text-xl font-bold mb-4">{sectionName}</h2>
            <div className="grid grid-cols-3 gap-4">
              {(expandedSections.includes(sectionName) ? items : items.slice(0, 15)).map((item) => (
                <button
                  key={item.id}
                  className={`bg-white border rounded-lg shadow p-4 flex items-center justify-center text-center ${
                    selectedItems.includes(item.nombre) ? "bg-blue-200 border-blue-500" : ""
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
              {!expandedSections.includes(sectionName) && (
                <button
                  className="bg-gray-300 text-gray-700 rounded-lg shadow p-4 flex items-center justify-center"
                  onClick={() => handleExpandSection(sectionName)}
                >
                  <MdKeyboardArrowRight size={24} />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Sección "Todos" con scroll infinito */}
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Todos</h2>
          <div className="grid grid-cols-3 gap-4">
            {visibleAllItems.map((item) => (
              <button
                key={item.id}
                className={`bg-white border rounded-lg shadow p-4 flex items-center justify-center text-center ${
                  selectedItems.includes(item.nombre) ? "bg-blue-200 border-blue-500" : ""
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
        </div>
      </div>

      {/* Botones flotantes y barra inferior */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-48 right-4">
          <button
            className="bg-red-500 text-white p-4 rounded-full shadow hover:bg-red-600"
            onClick={handleClearSelection}
          >
            <IoClose size={24} />
          </button>
        </div>
      )}
      <div className="fixed bottom-32 right-4">
        <button
          className="bg-green-600 text-white p-4 rounded-full shadow hover:bg-green-700"
          onClick={handleShare}
        >
          <FaWhatsapp size={24} />
        </button>
      </div>
      <div className="fixed bottom-16 right-4">
        <button
          className="bg-blue-700 text-white p-4 rounded-full shadow hover:bg-blue-800"
          onClick={handleSpeak}
        >
          <AiOutlineSound size={24} />
        </button>
      </div>
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
