import { RouterProvider } from 'react-router-dom';
import { router } from './common/routes';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Provider store={store}>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          className: 'text-[14px] font-medium font-["Plus_Jakarta_Sans"]',
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
            padding: '12px 24px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
          duration: 4000,
        }}
      />
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
