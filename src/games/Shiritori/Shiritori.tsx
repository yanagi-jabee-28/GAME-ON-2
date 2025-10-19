import { createSignal, For } from 'solid-js';

interface ShiritoriProps {
  onBack: () => void;
}

interface WordCard {
  id: string;
  word: string;
  used: boolean;
}

export default function Shiritori(props: ShiritoriProps) {
  const initialWords: WordCard[] = [
    { id: '1', word: 'りんご', used: false },
    { id: '2', word: 'ごりら', used: false },
    { id: '3', word: 'らっぱ', used: false },
    { id: '4', word: 'ぱそこん', used: false },
    { id: '6', word: 'ねこ', used: false },
    { id: '7', word: 'こあら', used: false },
    { id: '8', word: 'らくだ', used: false },
    { id: '9', word: 'だんご', used: false },
    { id: '10', word: 'ごま', used: false },
    { id: '11', word: 'まくら', used: false },
    { id: '12', word: 'らくがき', used: false },
    { id: '13', word: 'きつね', used: false },
    { id: '14', word: 'ねずみ', used: false },
    { id: '15', word: 'みかん', used: false },
    { id: '16', word: 'かんづめ', used: false },
    { id: '17', word: 'めだか', used: false },
    { id: '18', word: 'かばん', used: false },
    { id: '19', word: 'んこ', used: false },
    { id: '20', word: 'こぶた', used: false },
  ];

  const [availableWords, setAvailableWords] = createSignal<WordCard[]>(initialWords);
  const [sequence, setSequence] = createSignal<WordCard[]>([]);
  const [message, setMessage] = createSignal('');
  const [score, setScore] = createSignal(0);
  const [isCleared, setIsCleared] = createSignal(false);
  const [draggedCard, setDraggedCard] = createSignal<WordCard | null>(null);
  const [draggedFromSequence, setDraggedFromSequence] = createSignal(false);

  const onDragStart = (e: DragEvent, card: WordCard, fromSequence: boolean = false) => {
    e.dataTransfer!.setData('text/plain', card.id);
    setDraggedCard(card);
    setDraggedFromSequence(fromSequence);
  };

  const onDrop = (e: DragEvent, dropIndex?: number) => {
    e.preventDefault();
    const id = e.dataTransfer!.getData('text/plain');
    const dragged = draggedCard();

    if (!dragged) return;

    if (draggedFromSequence()) {
      // sequence内での並び替え
      if (dropIndex !== undefined) {
        const seq = sequence();
        const currentIndex = seq.findIndex(c => c.id === id);
        if (currentIndex !== -1 && currentIndex !== dropIndex) {
          const newSeq = [...seq];
          newSeq.splice(currentIndex, 1);
          newSeq.splice(dropIndex, 0, dragged);
          setSequence(newSeq);
        }
      }
    } else {
      // availableからsequenceへ追加
      const card = availableWords().find(w => w.id === id);
      if (card && !card.used) {
        if (dropIndex !== undefined) {
          // 指定位置に挿入
          const newSeq = [...sequence()];
          newSeq.splice(dropIndex, 0, { ...card, used: true });
          setSequence(newSeq);
        } else {
          // 末尾に追加
          setSequence(prev => [...prev, { ...card, used: true }]);
        }
        setAvailableWords(prev => prev.map(w => w.id === id ? { ...w, used: true } : w));
      }
    }

    setDraggedCard(null);
    setDraggedFromSequence(false);
    // ドロップ後に連鎖長を再計算
    // 小さな遅延で state が更新された後に計算する
    setTimeout(() => {
      calcLongestChain();
    }, 0);
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  // 与えられた sequence から最長の連続した正しいしりとりの長さを計算する
  const calcLongestChain = () => {
    const seq = sequence();
    if (seq.length === 0) {
      setScore(0);
      setIsCleared(false);
      return;
    }

    let maxLen = 1;
    let currentLen = 1;

    for (let i = 0; i < seq.length - 1; i++) {
      const curLast = seq[i].word[seq[i].word.length - 1];
      const nextFirst = seq[i + 1].word[0];
      if (curLast === nextFirst && !seq[i + 1].word.endsWith('ん')) {
        currentLen += 1;
      } else {
        // 切れた or 次が 'ん' で終わる場合はここで終了
        if (currentLen > maxLen) maxLen = currentLen;
        currentLen = 1;
      }
    }

    if (currentLen > maxLen) maxLen = currentLen;

    setScore(maxLen);
    if (maxLen >= 5) {
      setIsCleared(true);
      setMessage(`クリア！ ${maxLen}個の単語で連鎖しました！`);
    } else {
      setIsCleared(false);
      setMessage(`現在の最長連鎖: ${maxLen}`);
    }
  };

  const removeFromSequence = (index: number) => {
    const card = sequence()[index];
    setSequence(prev => prev.filter((_, i) => i !== index));
    setAvailableWords(prev => prev.map(w => w.id === card.id ? { ...w, used: false } : w));
    setTimeout(() => {
      calcLongestChain();
    }, 0);
  };

  const checkShiritori = () => {
    const seq = sequence();
    if (seq.length < 2) {
      setMessage('少なくとも2つの単語が必要です。');
      return;
    }

    // 「ん」で終わる単語があるかチェック
    const hasNEnding = seq.some(card => card.word.endsWith('ん'));
    if (hasNEnding) {
      setMessage('「ん」で終わっています！ゲームオーバーです。');
      setScore(0);
      setIsCleared(false);
      return;
    }

    let valid = true;
    for (let i = 0; i < seq.length - 1; i++) {
      const current = seq[i].word;
      const next = seq[i + 1].word;
      const lastChar = current[current.length - 1];
      const firstChar = next[0];
      if (lastChar !== firstChar) {
        valid = false;
        break;
      }
    }

    if (valid) {
      const newScore = seq.length;
      setScore(newScore);
      if (newScore >= 5) {
        setIsCleared(true);
        setMessage(`クリア！ ${newScore}個の単語でしりとりが完成しました！`);
      } else {
        setMessage(`正しいしりとりです！現在のスコア: ${newScore}`);
      }
    } else {
      setMessage('しりとりが正しくありません。');
      setScore(0);
      setIsCleared(false);
    }
  };

  const resetGame = () => {
    setAvailableWords(initialWords.map(w => ({ ...w, used: false })));
    setSequence([]);
    setMessage('');
    setScore(0);
    setIsCleared(false);
  };

  return (
    <div class="shiritori-game">
      <h2>しりとりゲーム</h2>
      <p>単語カードをドラッグして並べて、できるだけ長くしりとりを作りましょう。5つ以上でクリア！「ん」で終わるとゲームオーバーです。</p>
      <div class="score-display">
        <span>スコア: {score()}</span>
        {isCleared() && <span class="cleared">クリア！</span>}
      </div>

      <div class="available-words">
        <h3>使える単語</h3>
        <div class="word-cards">
          <For each={availableWords()}>
            {(card) => (
              !card.used && (
                <div
                  class="word-card"
                  draggable={true}
                  onDragStart={(e) => onDragStart(e, card)}
                >
                  {card.word}
                </div>
              )
            )}
          </For>
        </div>
      </div>

      <div class="drop-zone" onDrop={(e) => onDrop(e)} onDragOver={onDragOver}>
        <h3>並べる場所</h3>
        <div class="sequence">
          <For each={sequence()}>
            {(card, index) => (
              <div
                class="word-card placed"
                draggable={true}
                onDragStart={(e) => onDragStart(e, card, true)}
                onDrop={(e) => onDrop(e, index())}
                onDragOver={onDragOver}
                onClick={() => removeFromSequence(index())}
              >
                {card.word}
              </div>
            )}
          </For>
        </div>
        {sequence().length === 0 && <p>ここに単語をドロップしてください</p>}
      </div>

      <div class="controls">
        <button onClick={checkShiritori}>チェック</button>
        <button onClick={resetGame}>リセット</button>
        <button onClick={props.onBack}>戻る</button>
      </div>

      {message() && <div class="message">{message()}</div>}
    </div>
  );
}