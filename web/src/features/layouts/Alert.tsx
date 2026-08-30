import { X, MoveRight } from 'lucide-react';
import { useState } from 'react';

export const Alert = () => {
  const [hide, setHide] = useState<boolean>(false);
  return (
    <div className={`header-alert ${hide && 'hide'}`}>
      <p>
        Биднийг дэмжээд ердөө нэгхэн минут зарцуулан <br className="mob-br" />
        манай хуудсыг дагаарай.{' '}
        <a target="_blank" href="https://www.facebook.com/profile.php?id=100067530578732">
          Зочилох <MoveRight />
        </a>
      </p>

      <button onClick={() => setHide(true)}>
        <X />
      </button>
    </div>
  );
};
