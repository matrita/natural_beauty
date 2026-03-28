import { useAuth } from '../context/AuthContext'
import StaffAppuntamentiView from './appuntamenti/StaffAppuntamentiView'
import ClienteAppuntamentiView from './appuntamenti/ClienteAppuntamentiView'

export default function AppuntamentiView() {
  const { user } = useAuth()
  
  if (user?.ruolo === 'CLIENTE') {
    return <ClienteAppuntamentiView />
  }
  
  return <StaffAppuntamentiView />
}
