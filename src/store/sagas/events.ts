import { call, put, takeEvery, take } from 'redux-saga/effects'
import { eventChannel, END } from 'redux-saga'
import { EventActions as DrizzleEventActions } from "@drizzle/store"

import {
    EventTypes
} from "../types"

import {
    EventActions
} from "../actions"

// actions
function web3EventChannel(web3Contract, eventName, options, max) {
    const events = web3Contract.events[eventName](options);
    let count = 0;
    if (!max) { max = 100 };

    return eventChannel(emitter => {
        events.on('data', (event) => {
            emitter({ message: 'data', event })
            count += 1;
            if (count >= max) { emitter(END); }
        }).on('error', (error) => {
            emitter({ message: 'error', error })
            emitter(END)
        }).on('changed', (event) => {
            emitter({ message: 'changed', event })
            count += 1;
            if (count >= max) { emitter(END); }
        })

        // The subscriber must return an unsubscribe function
        return () => {
            events.unsubscribe()
        }
    }
    )
}

// fetch data from service using sagas
export function* fetchEvent(action: EventTypes.FetchEventAction) {
    const { eventName, web3Contract, options, name } = action.payload
    const max = action.payload.max || 100
    const chan = yield call(web3EventChannel, web3Contract, eventName, options, max)
    try {
        while (true) {
            //take('END')// will cause the saga to terminate by jumping to the finally block
            const e = yield take(chan)
            const { message, event, error } = e
            if (message === 'data') {
                //yield put({ type: EventActions.EVENT_FIRED, name, event, error })

                yield put(EventActions.createEvent({ ...event, networkId: action.payload.networkId }))

            } else if (message === 'error') {
                yield put({ type: DrizzleEventActions.EVENT_ERROR, name, event, error })
            } else if (message === 'changed') {
                yield put({ type: DrizzleEventActions.EVENT_CHANGED, name, event, error })
            }
        }
    } catch (error) {
        console.error(error)
    } finally {
        console.log('Event subscriber terminated')
    }
}

// app root saga
export function* eventsRootSaga() {
    yield takeEvery(EventTypes.FETCH_EVENT, fetchEvent)
}