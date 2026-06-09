import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
import './AboutScreen.css';

const VERSION = '2.0.0';

const HOW_TO_PLAY = [
  { icon: '🎯', title: 'Objectivo', text: 'Dizer uma palavra válida para a letra e categoria sorteadas antes do tempo acabar.' },
  { icon: '🔤', title: 'Letra sorteada', text: 'Cada ronda sorteia uma letra aleatória do alfabeto. Todas as 23 letras são usadas ao longo do jogo.' },
  { icon: '📂', title: 'Categorias', text: 'Uma categoria é sorteada por ronda: País, Nome, Cor, Animal, Objeto, Fruta, Cidade, Profissão, Marca ou Filme. Podes escolher quais as categorias activas no setup.' },
  { icon: '⏱️', title: 'Timer', text: 'O jogador da vez tem o tempo definido para responder. Quando acaba, os outros validam e atribuem pontos.' },
  { icon: '✍️', title: 'Resposta', text: 'Podes dizer em voz alta, escrever no campo de texto, ou usar o microfone para reconhecimento automático de voz.' },
  { icon: '⭐', title: 'Pontuação', text: 'Cada resposta válida vale 1 ponto. Usa os botões +/− para ajustar pontos manualmente.' },
  { icon: '🏆', title: 'Fim do jogo', text: 'O jogo termina após todas as letras serem usadas. Quem tiver mais pontos vence!' },
  { icon: '⏸️', title: 'Menu do jogo', text: 'Usa o botão ⋯ (canto superior esquerdo) para pausar, saltar letra, ou recomeçar a qualquer momento.' },
];

export function AboutScreen() {
  const { dispatch } = useGame();

  return (
    <div className="about-screen">
      <div className="app-bg" />
      <div className="about-content">

        <div className="about-header animate-slide-up">
          <button className="about-back-btn" onClick={() => dispatch({ type: 'GO_TO_SETUP' })}>←</button>
          <h1 className="about-title">Sobre</h1>
          <div style={{ width: 40 }} />
        </div>

        <Card className="about-app-card animate-scale-in">
          <Logo size="md" showName={false} />
          <div className="about-app-info">
            <h2 className="about-app-name">Letra a Letra</h2>
            <span className="about-version">v{VERSION}</span>
          </div>
          <p className="about-desc">
            O jogo tradicional das letras, agora digital. Para jogar com família e amigos em qualquer lugar.
          </p>
          <div className="about-author">
            <span>Desenvolvido por</span>
            <strong>Hugo</strong>
          </div>
        </Card>

        <div className="about-section-title animate-slide-up">Como jogar?</div>

        <div className="about-steps">
          {HOW_TO_PLAY.map((step, i) => (
            <Card key={step.title} className="about-step animate-slide-up" style={{ animationDelay: `${i * 40}ms` }} padding="sm">
              <div className="about-step-icon">{step.icon}</div>
              <div className="about-step-text">
                <div className="about-step-title">{step.title}</div>
                <div className="about-step-desc">{step.text}</div>
              </div>
            </Card>
          ))}
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={() => dispatch({ type: 'GO_TO_SETUP' })}>
          Jogar agora
        </Button>

      </div>
    </div>
  );
}
