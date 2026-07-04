import { useState, useRef, useEffect } from 'react';
import { startRecognition, stopRecognition, isRecognitionSupported } from '@/services/recognitionService';
import { startsWithLetter } from '@/services/dictionaryService';
import { playPoint } from '@/services/soundService';
import type { CategoryKey } from '@/types';
import './AnswerInput.css';

interface AnswerInputProps {
  currentLetter: string;
  currentCategory: CategoryKey;
  onValidAnswer: () => void;
  onAnswer?: (answer: string, valid: boolean) => void;
}

type Status = 'idle' | 'listening' | 'submitted' | 'valid' | 'invalid';

export function AnswerInput({ currentLetter, currentCategory, onValidAnswer, onAnswer }: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState('');
  const validatedRef = useRef(false);

  const [feedbackType, setFeedbackType] = useState<'ok' | 'err' | 'info'>('info');

  useEffect(() => {
    setAnswer('');
    setStatus('idle');
    setFeedback('');
    setFeedbackType('info');
    validatedRef.current = false;
  }, [currentLetter, currentCategory]);

  function handleSubmit() {
    const trimmed = answer.trim();
    if (!trimmed || status === 'submitted' || status === 'valid') return;

    // Verificar só a letra — validação do conteúdo é humana
    if (!startsWithLetter(trimmed, currentLetter)) {
      setFeedback(`"${trimmed}" não começa por ${currentLetter.toUpperCase()}.`);
      setStatus('invalid');
      return;
    }

    setStatus('submitted');
    setFeedback('');
  }

  function handleVote(valid: boolean) {
    if (validatedRef.current) return;
    const trimmed = answer.trim();
    if (valid) {
      setStatus('valid');
      setFeedback(`✓ "${trimmed}" aceite!`);
      setFeedbackType('ok');
      validatedRef.current = true;
      playPoint();
      onValidAnswer();
      onAnswer?.(trimmed, true);
    } else {
      setStatus('idle');
      setAnswer('');
      setFeedback('✗ Não aceite. Tenta outra palavra!');
      setFeedbackType('err');
      onAnswer?.(trimmed, false);
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
    setAnswer('');
    setFeedback('');

    startRecognition(
      (transcript, isFinal) => {
        setAnswer(transcript);
        if (isFinal) {
          setListening(false);
          // Após reconhecimento, submeter automaticamente para votação
          if (startsWithLetter(transcript, currentLetter)) {
            setStatus('submitted');
          } else {
            setStatus('invalid');
            setFeedback(`"${transcript}" não começa por ${currentLetter.toUpperCase()}.`);
          }
        }
      },
      (error) => {
        setListening(false);
        setStatus('idle');
        setFeedback(error === 'no-speech' ? 'Não ouvi nada. Tenta de novo.' : 'Erro no microfone.');
      },
      () => setListening(false)
    );
  }

  const isSubmitted = status === 'submitted';
  const isDone = status === 'valid'; // só bloqueia quando válido, não quando inválido

  const wrapperClass = status === 'valid' ? 'answer-valid'
    : status === 'invalid' ? 'answer-invalid'
    : status === 'submitted' ? 'answer-submitted'
    : status === 'listening' ? 'answer-listening'
    : '';

  return (
    <div className={`answer-input-wrapper ${wrapperClass}`}>

      {/* Input + botões de entrada */}
      {!isSubmitted && !isDone && (
        <div className="answer-input-row">
          <input
            className="answer-input"
            type="text"
            value={answer}
            onChange={e => { setAnswer(e.target.value); setStatus('idle'); setFeedback(''); }}
            onKeyDown={handleKeyDown}
            placeholder={`Palavra com ${currentLetter.toUpperCase()}…`}
            maxLength={40}
            disabled={listening}
            autoComplete="off"
            autoCapitalize="none"
          />

          {isRecognitionSupported() && (
            <button
              className={`mic-btn ${listening ? 'mic-active' : ''}`}
              onClick={handleMic}
              aria-label={listening ? 'Parar' : 'Microfone'}
            >
              {listening ? '⏹' : '🎤'}
            </button>
          )}

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={answer.trim().length < 2 || listening}
            aria-label="Submeter"
          >
            →
          </button>
        </div>
      )}

      {/* Resposta submetida — aguardar votação */}
      {isSubmitted && (
        <div className="answer-voting">
          <div className="answer-voting-word">
            <span className="answer-voting-label">Resposta:</span>
            <span className="answer-voting-value">{answer.trim()}</span>
          </div>
          <p className="answer-voting-question">Os outros jogadores aceitam?</p>
          <div className="answer-voting-btns">
            <button className="vote-btn vote-valid" onClick={() => handleVote(true)}>
              ✓ Válido
            </button>
            <button className="vote-btn vote-invalid" onClick={() => handleVote(false)}>
              ✗ Inválido
            </button>
          </div>
        </div>
      )}

      {/* Feedback final */}
      {feedback && (
        <div className={`answer-feedback feedback-${feedbackType}`}>
          {feedback}
        </div>
      )}
    </div>
  );
}
