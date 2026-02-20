import { takeLatest, put, call } from 'redux-saga/effects';
import { fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure } from './dashboardSlice';
import { fetchDashboardStats } from '../../services/dashboardService';

function* handleFetchStats() {
    try {
        const stats = yield call(fetchDashboardStats);
        yield put(fetchStatsSuccess(stats));
    } catch (error) {
        yield put(fetchStatsFailure(error.message));
    }
}

export default function* dashboardSaga() {
    yield takeLatest(fetchStatsRequest.type, handleFetchStats);
}
