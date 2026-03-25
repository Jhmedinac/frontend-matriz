import { useEffect, useState } from 'react'

const TareaCard = ({ tarea, obtenerColor, onCompletar, onEliminar, bgColor, borderColor }) => (
  <li className={`group flex justify-between items-start p-3 ${bgColor} rounded border ${borderColor} transition-all hover:shadow-md`}>
    <div className="flex flex-col pr-2">
      <span className="font-medium text-slate-800">{tarea.Titulo}</span>
      <span className={`text-xs mt-2 px-2 py-1 rounded-full w-max ${obtenerColor(tarea.Categoria)}`}>
        {tarea.Categoria}
      </span>
    </div>
    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={() => onCompletar(tarea.Id)} className="text-green-600 hover:bg-green-200 px-2 py-1 rounded font-bold" title="Completar">✓</button>
      <button onClick={() => onEliminar(tarea.Id)} className="text-red-500 hover:bg-red-200 px-2 py-1 rounded font-bold" title="Eliminar">✕</button>
    </div>
  </li>
)

function App() {
  const [tareas, setTareas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [mostrarModalTarea, setMostrarModalTarea] = useState(false)
  const [mostrarModalCat, setMostrarModalCat] = useState(false)

  const [nuevaTarea, setNuevaTarea] = useState({ Titulo: '', EsImportante: false, EsUrgente: false, Categoria: 'Desarrollo' })
  const [nuevaCat, setNuevaCat] = useState({ Nombre: '', Color: 'bg-purple-100 text-purple-800' })

  const cargarDatos = () => {
    fetch('https://eisenhower-backend-dogg5r-c225d2-72-61-3-11.traefik.me:3000/api/tareas').then(res => res.json()).then(setTareas)
    fetch('https://eisenhower-backend-dogg5r-c225d2-72-61-3-11.traefik.me:3000/api/categorias').then(res => res.json()).then(data => {
      setCategorias(data);
      if (data.length > 0 && nuevaTarea.Categoria === '') setNuevaTarea({ ...nuevaTarea, Categoria: data[0].Nombre });
    })
  }

  useEffect(() => { cargarDatos() }, [])

  // --- Funciones de Tareas ---
  const handleGuardarTarea = async (e) => {
    e.preventDefault()
    await fetch('https://eisenhower-backend-dogg5r-c225d2-72-61-3-11.traefik.me:3000/api/tareas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevaTarea)
    })
    cargarDatos()
    setMostrarModalTarea(false)
    setNuevaTarea({ Titulo: '', EsImportante: false, EsUrgente: false, Categoria: categorias[0]?.Nombre || 'Desarrollo' })
  }

  const completarTarea = async (id) => {
    await fetch(`https://eisenhower-backend-dogg5r-c225d2-72-61-3-11.traefik.me:3000/api/tareas/${id}/completar`, { method: 'PUT' })
    cargarDatos()
  }

  const eliminarTarea = async (id) => {
    if (window.confirm('¿Eliminar esta tarea permanentemente?')) {
      await fetch(`https://eisenhower-backend-dogg5r-c225d2-72-61-3-11.traefik.me:3000/api/tareas/${id}`, { method: 'DELETE' })
      cargarDatos()
    }
  }

  // --- Funciones de Categorías ---
  const handleGuardarCategoria = async (e) => {
    e.preventDefault()
    await fetch('https://eisenhower-backend-dogg5r-c225d2-72-61-3-11.traefik.me:3000/api/categorias', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevaCat)
    })
    cargarDatos()
    setNuevaCat({ Nombre: '', Color: 'bg-purple-100 text-purple-800' })
  }

  const eliminarCategoria = async (nombre) => {
    if (window.confirm(`¿Eliminar la categoría "${nombre}"? Las tareas existentes la conservarán en texto.`)) {
      await fetch(`https://eisenhower-backend-dogg5r-c225d2-72-61-3-11.traefik.me:3000/api/categorias/${nombre}`, { method: 'DELETE' })
      cargarDatos()
    }
  }

  // --- Utilidades Visuales ---
  const tareasPorCuadrante = (c) => tareas.filter(t => t.Cuadrante === c)
  const obtenerColor = (nombreCat) => {
    const cat = categorias.find(c => c.Nombre === nombreCat);
    return cat ? cat.Color : 'bg-slate-100 text-slate-800'; // Color por defecto si se eliminó
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans relative">
      <header className="mb-8 flex justify-between items-center max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Productividad Personal</h1>
          <p className="text-slate-500">La Matriz de Gestión del Tiempo</p>
        </div>
        <div className="space-x-3">
          <button onClick={() => setMostrarModalCat(true)} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg shadow-sm font-medium transition-colors">
            Categorías
          </button>
          <button onClick={() => setMostrarModalTarea(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow font-medium transition-colors">
            + Nueva Tarea
          </button>
        </div>
      </header>

      {/* Grid de Cuadrantes */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: 'Q1_Hacer', titulo: 'Hacer (Urgente e Importante)', color: 'red', bg: 'bg-red-50', border: 'border-red-100' },
          { id: 'Q2_Planificar', titulo: 'Planificar (Importante, No Urgente)', color: 'blue', bg: 'bg-blue-50', border: 'border-blue-100' },
          { id: 'Q3_Delegar', titulo: 'Delegar (Urgente, No Importante)', color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-100' },
          { id: 'Q4_Eliminar', titulo: 'Eliminar (No Urgente, No Importante)', color: 'gray', bg: 'bg-gray-50', border: 'border-gray-200' },
        ].map(q => (
          <div key={q.id} className={`bg-white border-t-4 border-${q.color}-500 rounded-lg shadow-sm p-6`}>
            <h2 className={`text-xl font-bold text-${q.color}-600 mb-4 border-b pb-2`}>Cuadrante: {q.titulo}</h2>
            <ul className="space-y-3">
              {tareasPorCuadrante(q.id).map(tarea => (
                <TareaCard key={tarea.Id} tarea={tarea} obtenerColor={obtenerColor} onCompletar={completarTarea} onEliminar={eliminarTarea} bgColor={q.bg} borderColor={q.border} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Modal: NUEVA TAREA */}
      {mostrarModalTarea && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Agregar Tarea</h3>
            <form onSubmit={handleGuardarTarea} className="space-y-4">
              <input type="text" required placeholder="Título..." className="w-full border rounded-lg px-3 py-2" value={nuevaTarea.Titulo} onChange={(e) => setNuevaTarea({ ...nuevaTarea, Titulo: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2 border p-2 rounded cursor-pointer"><input type="checkbox" checked={nuevaTarea.EsImportante} onChange={(e) => setNuevaTarea({ ...nuevaTarea, EsImportante: e.target.checked })} /><span>Importante</span></label>
                <label className="flex items-center space-x-2 border p-2 rounded cursor-pointer"><input type="checkbox" checked={nuevaTarea.EsUrgente} onChange={(e) => setNuevaTarea({ ...nuevaTarea, EsUrgente: e.target.checked })} /><span>Urgente</span></label>
              </div>
              <select className="w-full border rounded-lg px-3 py-2" value={nuevaTarea.Categoria} onChange={(e) => setNuevaTarea({ ...nuevaTarea, Categoria: e.target.value })}>
                {categorias.map(c => <option key={c.Nombre} value={c.Nombre}>{c.Nombre}</option>)}
              </select>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setMostrarModalTarea(false)} className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: GESTIONAR CATEGORÍAS */}
      {mostrarModalCat && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Gestionar Categorías</h3>
              <button onClick={() => setMostrarModalCat(false)} className="text-slate-400 font-bold text-xl">&times;</button>
            </div>

            <ul className="space-y-2 mb-6 max-h-48 overflow-y-auto">
              {categorias.map(cat => (
                <li key={cat.Nombre} className="flex justify-between items-center border-b pb-2">
                  <span className={`px-2 py-1 text-sm rounded-full ${cat.Color}`}>{cat.Nombre}</span>
                  <button onClick={() => eliminarCategoria(cat.Nombre)} className="text-red-500 hover:text-red-700 text-sm font-bold">✕</button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleGuardarCategoria} className="bg-slate-50 p-3 rounded border space-y-3">
              <p className="text-sm font-medium text-slate-700">Agregar nueva</p>
              <input type="text" required placeholder="Nombre (ej. Universidad)" className="w-full border rounded px-3 py-1 text-sm" value={nuevaCat.Nombre} onChange={(e) => setNuevaCat({ ...nuevaCat, Nombre: e.target.value })} />
              <select className="w-full border rounded px-3 py-1 text-sm" value={nuevaCat.Color} onChange={(e) => setNuevaCat({ ...nuevaCat, Color: e.target.value })}>
                <option value="bg-purple-100 text-purple-800">Morado</option>
                <option value="bg-pink-100 text-pink-800">Rosa</option>
                <option value="bg-teal-100 text-teal-800">Verde Azulado</option>
                <option value="bg-indigo-100 text-indigo-800">Índigo</option>
                <option value="bg-amber-100 text-amber-800">Ámbar</option>
              </select>
              <button type="submit" className="w-full bg-slate-800 text-white rounded py-1 text-sm">Agregar Categoría</button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default App
