import ashChatLogo from './assets/logo.png'

export function App(){
  return (
    <main className='body h-screen w-screen flex flex-col'>
      <img alt="logo" className="logo" src={ashChatLogo} />
      <p className="text-5xl text-white font-kenia">AshChat</p>

      <div className="text">
        A real-time chat app <span className="react">powered by AI</span> to facilitate communication <br /><span className="ts">around the world!</span>
      </div>

      <div className="actions">
        <div className="action">
          <button>
              Get Started
          </button>
        </div>
      </div>
    </main>
  )
}
