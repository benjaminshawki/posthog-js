import {
    ErrorProperties,
    errorToProperties,
    unhandledRejectionToProperties,
} from '../extensions/exception-autocapture/error-conversion'
import { assignableWindow, window } from '../utils/globals'
import { ErrorEventArgs } from '../types'
import { createLogger } from '../utils/logger'

const logger = createLogger('[ExceptionAutocapture]')

const wrapOnError = (captureFn: (props: ErrorProperties) => void) => {
    const win = window as any
    if (!win) {
        logger.info('window not available, cannot wrap onerror')
    }
    const originalOnError = win.onerror

    win.onerror = function (...args: ErrorEventArgs): boolean {
        const errorProperties = errorToProperties({ event: args[0], error: args[4] })
        captureFn(errorProperties)
        return originalOnError?.(...args) ?? false
    }
    win.onerror.__POSTHOG_INSTRUMENTED__ = true

    return () => {
        delete win.onerror?.__POSTHOG_INSTRUMENTED__
        win.onerror = originalOnError
    }
}

const wrapUnhandledRejection = (captureFn: (props: ErrorProperties) => void) => {
    const win = window as any
    if (!win) {
        logger.info('window not available, cannot wrap onUnhandledRejection')
    }

    const originalOnUnhandledRejection = win.onunhandledrejection

    win.onunhandledrejection = function (...args: [ev: PromiseRejectionEvent]): boolean {
        const errorProperties = unhandledRejectionToProperties(args)
        captureFn(errorProperties)
        return originalOnUnhandledRejection?.apply(win, args) ?? false
    }
    win.onunhandledrejection.__POSTHOG_INSTRUMENTED__ = true

    return () => {
        delete win.onunhandledrejection?.__POSTHOG_INSTRUMENTED__
        win.onunhandledrejection = originalOnUnhandledRejection
    }
}

const wrapConsoleError = (captureFn: (props: ErrorProperties) => void) => {
    const con = console as any
    if (!con) {
        logger.info('console not available, cannot wrap console.error')
    }

    const originalConsoleError = con.error

    con.error = function (...args: any[]): void {
        const event = args.join(' ')
        const error = args.find((arg) => arg instanceof Error)
        const errorProperties = error
            ? errorToProperties({ event, error })
            : errorToProperties({ event }, { syntheticException: new Error('PostHog syntheticException') })

        captureFn(errorProperties)
        return originalConsoleError?.(...args)
    }
    con.error.__POSTHOG_INSTRUMENTED__ = true

    return () => {
        delete con.error?.__POSTHOG_INSTRUMENTED__
        con.error = originalConsoleError
    }
}

const posthogErrorWrappingFunctions = {
    wrapOnError,
    wrapUnhandledRejection,
    wrapConsoleError,
}

assignableWindow.__PosthogExtensions__ = assignableWindow.__PosthogExtensions__ || {}
assignableWindow.__PosthogExtensions__.errorWrappingFunctions = posthogErrorWrappingFunctions

// we used to put these on window, and now we put them on __PosthogExtensions__
// but that means that old clients which lazily load this extension are looking in the wrong place
// yuck,
// so we also put them directly on the window
// when 1.161.1 is the oldest version seen in production we can remove this
assignableWindow.posthogErrorWrappingFunctions = posthogErrorWrappingFunctions

export default posthogErrorWrappingFunctions
