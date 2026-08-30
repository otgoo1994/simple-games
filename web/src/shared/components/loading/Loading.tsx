import ReactDOM from 'react-dom';

export const Loading = () => {
  const modalRoot = document.getElementById('modal');

  return modalRoot
    ? ReactDOM.createPortal(
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100vh',
            background: '#0f172a',
          }}
        >
          <img src="/images/logo_white.png" alt="" style={{ width: '6%', height: 'auto' }} />
        </div>,
        modalRoot,
      )
    : null;
};
