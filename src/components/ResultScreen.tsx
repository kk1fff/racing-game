interface ResultScreenProps {
  result: 'user' | 'computer'
  onReplay: () => void
  onNewDuration: () => void
  onShare: () => void
  shareSupported: boolean
}

export function ResultScreen({ result, onReplay, onNewDuration, onShare, shareSupported }: ResultScreenProps) {
  const isUser = result === 'user'
  return (
    <div className="screen result-screen" role="dialog" aria-modal="true" aria-labelledby="result-heading">
      <div className="card result-card">
        <h1 id="result-heading" className="title result-title">
          {isUser ? 'YOU WON!' : 'Computer Won'}
        </h1>
        <p className="subtitle">
          {isUser
            ? 'Fantastic job finishing before the runner! Keep the streak going!'
            : 'The runner reached the finish this time, but you can beat them on the next round!'}
        </p>
        <div className="result-actions">
          <button type="button" className="primary" onClick={onReplay}>
            Race Again
          </button>
          <button type="button" className="secondary" onClick={onNewDuration}>
            New Duration
          </button>
          <button type="button" className="secondary" onClick={onShare} disabled={!shareSupported}>
            Share Result
          </button>
        </div>
      </div>
    </div>
  )
}
