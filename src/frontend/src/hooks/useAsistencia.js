import { useEffect, useState } from 'react'
import {
  obtenerRegistroAsistencia,
} from '../services/asistenciasService'
import {
  obtenerEstudiantesClase,
  obtenerMisClases,
} from '../services/clasesService'
import { getApiErrorMessage } from '../services/api'
import { getApiData } from '../services/api'

function createDefaultAttendance(estudiantes) {
  return estudiantes.map((estudiante) => ({
    apellidos_estudiante: estudiante.apellidos,
    asistio: true,
    atrasado: false,
    id_asistencia: 0,
    id_estudiante: estudiante.id_estudiante,
    justificativo: null,
    nombres_estudiante: estudiante.nombres,
    observaciones: null,
  }))
}

export function useAsistencia(idHorario, initialFechaStr) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    if (initialFechaStr) {
      // Evitar problemas de zona horaria parseando la fecha localmente
      const [year, month, day] = initialFechaStr.split('-');
      return new Date(year, month - 1, day);
    }
    return new Date();
  });

  const [asistencias, setAsistencias] = useState([])
  const [clase, setClase] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [observacionesSesion, setObservacionesSesion] = useState('')
  const [registroExistente, setRegistroExistente] = useState(null)

  const fechaFormateada = fechaSeleccionada.toISOString().split('T')[0];

  const irSemanaAnterior = () => {
    setFechaSeleccionada(prev => {
      const nueva = new Date(prev);
      nueva.setDate(nueva.getDate() - 7);
      return nueva;
    });
  };

  const irSemanaSiguiente = () => {
    setFechaSeleccionada(prev => {
      const nueva = new Date(prev);
      nueva.setDate(nueva.getDate() + 7);
      return nueva;
    });
  };

  const irHoy = () => {
    setFechaSeleccionada(new Date());
  };

  useEffect(() => {
    let isActive = true

    async function loadAsistencia() {
      setIsLoading(true);
      setError('');
      try {
        const clasesResponse = await obtenerMisClases()
        const clases = getApiData(clasesResponse) ?? []
        const selectedClase = clases.find((item) =>
          item.horarios.some((horario) => horario.id_horario === Number(idHorario)),
        )

        if (!selectedClase) {
          throw new Error('No se encontró una clase asociada al horario seleccionado.')
        }

        const [estudiantesResponse, registroResponse] = await Promise.all([
          obtenerEstudiantesClase(selectedClase.id_clase),
          obtenerRegistroAsistencia(idHorario, fechaFormateada),
        ])

        if (!isActive) return

        const registro = getApiData(registroResponse)
        setClase(selectedClase)
        setRegistroExistente(registro)
        setObservacionesSesion(registro?.observaciones_sesion ?? '')
        setAsistencias(
          registro?.asistencias?.length
            ? registro.asistencias
            : createDefaultAttendance(getApiData(estudiantesResponse) ?? []),
        )
      } catch (requestError) {
        if (isActive) {
          setError(getApiErrorMessage(requestError))
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadAsistencia()

    return () => {
      isActive = false
    }
  }, [fechaFormateada, idHorario])

  return {
    asistencias,
    clase,
    error,
    isEditing: Boolean(registroExistente),
    isLoading,
    observacionesSesion,
    registroExistente,
    setAsistencias,
    setObservacionesSesion,
    fechaSeleccionada,
    fechaFormateada,
    setFechaSeleccionada,
    irSemanaAnterior,
    irSemanaSiguiente,
    irHoy
  }
}
