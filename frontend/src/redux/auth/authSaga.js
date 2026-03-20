import { takeLatest, put } from 'redux-saga/effects';
import { loginRequest, loginSuccess, loginFailure } from './authSlice';
// import { loginApi } from '../../services/authService'; // Assuming this exists

function* handleLogin() {
    try {
        // const user = yield call(loginApi, action.payload);
        const user = { name: 'User', email: 'test@example.com' }; // Mock
        yield put(loginSuccess(user));
    } catch (error) {
        yield put(loginFailure(error.message));
    }
}

export default function* authSaga() {
    yield takeLatest(loginRequest.type, handleLogin);
}
