import { all } from 'redux-saga/effects';
import authSaga from './auth/authSaga';
import dashboardSaga from './dashboard/dashboardSaga';

export default function* rootSaga() {
    yield all([
        authSaga(),
        dashboardSaga(),
    ]);
}
