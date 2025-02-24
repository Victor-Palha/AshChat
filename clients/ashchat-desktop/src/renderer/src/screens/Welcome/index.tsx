import { Button } from '../../components/Button'
import ashChatLogo from '../../assets/logo.png'
import { useNavigate } from 'react-router-dom'
import { useValidate } from '../../hooks/useValidate'

export function Welcome(){
  useValidate();
  const navigate = useNavigate()
  function handleStart(){
    navigate('/login')
  }
  return (
    <main className='body h-screen w-screen flex flex-col'>
      <img alt="logo" className="logo" src={ashChatLogo} />
      <p className="text-5xl text-white font-kenia">AshChat</p>

      <div className="text">
        A real-time chat app <span className="react">powered by AI</span> to facilitate communication <br /><span className="ts">around the world!</span>
      </div>

      <div className="actions">
        <div className="action">
            <Button title='Get Started' onClick={handleStart}/>
        </div>
      </div>
    </main>
  )
}
