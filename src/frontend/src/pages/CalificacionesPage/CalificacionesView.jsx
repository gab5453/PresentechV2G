import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCalificaciones } from '../../hooks/useCalificaciones';
import './CalificacionesView.css';

const CalificacionesView = () => {
  const { idClase } = useParams();
  const navigate = useNavigate();
  const { matriz, loading, error, fetchMatriz, crearActividad, registrarNota } = useCalificaciones(idClase);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityType, setNewActivityType] = useState('Deber');

  useEffect(() => {
    fetchMatriz();
  }, [fetchMatriz]);

  const handleCreateActivity = async () => {
    if (!newActivityName.trim()) return;
    
    const result = await crearActividad({
      nombre: newActivityName,
      tipo: newActivityType,
      fecha: new Date().toISOString()
    });

    if (result.success) {
      setIsModalOpen(false);
      setNewActivityName('');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleNotaBlur = async (actividadId, estudianteId, e) => {
    const value = e.target.value;
    if (value === '') return; // O se podría enviar null para borrar
    
    const notaNum = parseFloat(value);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
      alert('La nota debe ser un número entre 0 y 10');
      return;
    }

    const result = await registrarNota(actividadId, estudianteId, notaNum);
    if (!result.success) {
      alert(`Error al guardar nota: ${result.error}`);
    }
  };

  if (loading) return <div className="loading">Cargando calificaciones...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!matriz) return null;

  return (
    <div className="calificaciones-container">
      <div className="calificaciones-header">
        <button className="btn-back" onClick={() => navigate(-1)}>← Volver</button>
        <h2>Calificaciones de la Clase</h2>
      </div>

      <div className="table-wrapper">
        <table className="excel-table">
          <thead>
            <tr>
              <th className="sticky-col">Estudiante</th>
              {matriz.actividades.map(act => (
                <th key={act.id}>
                  {act.nombre}
                  <span className="act-type">({act.tipo})</span>
                </th>
              ))}
              <th className="action-th">
                <button className="btn-add-column" onClick={() => setIsModalOpen(true)}>+</button>
              </th>
              <th>Promedio</th>
            </tr>
          </thead>
          <tbody>
            {matriz.estudiantes.map(est => (
              <tr key={est.estudianteId} className={est.requiereAlarma ? 'row-alarm' : ''}>
                <td className="sticky-col">
                  {est.apellidos} {est.nombres}
                  {est.requiereAlarma && <span className="icon-alarm" title="Bajo rendimiento">⚠️</span>}
                </td>
                
                {matriz.actividades.map(act => {
                  const currentNota = est.notas[act.id];
                  return (
                    <td key={act.id}>
                      <input 
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        defaultValue={currentNota !== null ? currentNota : ''}
                        onBlur={(e) => handleNotaBlur(act.id, est.estudianteId, e)}
                        className="nota-input"
                      />
                    </td>
                  );
                })}
                <td></td> {/* Celda vacía bajo el botón de + */}
                <td className={`promedio-cell ${est.requiereAlarma ? 'promedio-low' : ''}`}>
                  {est.promedio !== null ? est.promedio.toFixed(2) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nueva Actividad</h3>
            <div className="form-group">
              <label>Nombre</label>
              <input 
                type="text" 
                value={newActivityName}
                onChange={e => setNewActivityName(e.target.value)}
                placeholder="Ej. Lección 1"
              />
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select value={newActivityType} onChange={e => setNewActivityType(e.target.value)}>
                <option value="Deber">Deber</option>
                <option value="Taller">Taller</option>
                <option value="Leccion">Lección</option>
                <option value="Participacion">Participación</option>
                <option value="Examen">Examen</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setIsModalOpen(false)} className="btn-cancel">Cancelar</button>
              <button onClick={handleCreateActivity} className="btn-confirm">Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalificacionesView;
