import { RouterProvider } from 'react-router-dom';
import { router } from './common/routes';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { Toaster } from './utils/toast-mock';

function App() {
  return (
    <Provider store={store}>
      <Toaster position="top-right" reverseOrder={false} />
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
