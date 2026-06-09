import { useState, useRef, useEffect } from 'react';
import { startRecognition, stopRecognition, isRecognitionSupported } from '@/services/recognitionService';
import './AnswerInput.css';

interface AnswerInputProps {
  currentLetter: string;
  onValidAnswer: () => void;
}

type Status = 'idle' | 'listening' | 'valid' | 'invalid';

export function AnswerInput({ currentLetter, onValidAnswer }: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const validatedRef = useRef(false);

  useEffect(() => {
    // Limpar ao mudar de letra
    setAnswer('');
    setStatus('idle');
    setFeedback('');
    validatedRef.current = false;
  }, [currentLetter]);

  function validate(text: string): boolean {
    const clean = text.trim().toLowerCase();
    if (clean.length === 0) return false;
    // Aceitar a resposta se começar pela letra correcta
    // Remover acentos para comparação
    const normalize = (s: string) =>
      s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return normalize(clean).startsWith(normalize(currentLetter));
  }

  function handleSubmit() {
    if (validatedRef.current) return;
    const ok = validate(answer);
    setStatus(ok ? 'valid' : 'invalid');
    setFeedback(ok
      ? `✓ "${answer}" é válido!`
      : `✗ "${answer}" não começa por ${currentLetter}.`
    );
    if (ok) {
      validatedRef.current = true;
      onValidAnswer();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }

  function handleMic() {
    if (listening) {
      stopRecognition();
      setListening(false);
      return;
    }

    setListening(true);
    setStatus('listening');
    setFeedback('A ouvir…');
    setAnswer('');

    startRecognition(
      (transcript, isFinal) => {
        setAnswer(transcript);
        if (isFinal) {
          setListening(false);
          const ok = validate(transcript);
          setStatus(ok ? 'valid' : 'invalid');
          setFeedback(ok
            ? `✓ "${transcript}" é válido!`
            : `✗ "${transcript}" não começa por ${currentLetter}.`
          );
          if (ok && !validatedRef.current) {
            validatedRef.current = true;
            onValidAnswer();
          }
        }
      },
      (error) => {
        setListening(false);
        setStatus('idle');
        setFeedback(error === 'no-speech' ? 'Não ouvi nada. Tenta de novo.' : 'Erro no microfone.');
      },
      () => { setListening(false); }
    );
  }

  const statusClass = status === 'valid' ? 'answer-valid'
    : status === 'invalid' ? 'answer-invalid'
    : status === 'listening' ? 'answer-listening'
    : '';

  return (
    <div className={`answer-input-wrapper ${statusClass}`}>
      <div className="answer-input-row">
        <input
          ref={inputRef}
          className="answer-input"
          type="text"
          value={answer}
          onChange={e => { setAnswer(e.target.value); setStatus('idle'); setFeedback(''); }}
          onKeyDown={handleKeyDown}
          placeholder={`Escreve uma palavra com ${currentLetter}…`}
          maxLength={40}
          disabled={listening}
        />

        {/* Botão microfone */}
        {isRecognitionSupported() && (
          <button
            className={`mic-btn ${listening ? 'mic-active' : ''}`}
            onClick={handleMic}
            aria-label={listening ? 'Parar gravação' : 'Falar resposta'}
          >
            {listening ? '⏹' : '🎤'}
          </button>
        )}

        {/* Botão validar */}
        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={answer.trim().length === 0 || listening}
          aria-label="Validar resposta"
        >
          ✓
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`answer-feedback ${status === 'valid' ? 'feedback-ok' : status === 'invalid' ? 'feedback-err' : 'feedback-info'}`}>
          {feedback}
        </div>
      )}
    </div>
  );
}
