import '../src/__tests__/helpers/mock-logger'

import { createPosthogInstance } from '../src/__tests__/helpers/posthog-instance'
import { waitFor } from '@testing-library/dom'
import { getRequests, resetRequests } from './mock-server'
import { uuidv7 } from '../src/uuidv7'

async function shortWait() {
    // no need to worry about ie11 compat in tests
    // eslint-disable-next-line compat/compat
    await new Promise<void>((resolve: () => void) => setTimeout(resolve, 500))
}

describe('FunctionalTests / Feature Flags', () => {
    let token: string

    beforeEach(() => {
        token = uuidv7()
    })

    test('person properties set in identify() with new distinct_id are sent to /flags', async () => {
        const posthog = await createPosthogInstance(token, { advanced_disable_flags: false })

        const anonymousId = posthog.get_distinct_id()

        await waitFor(() => {
            expect(getRequests(token)['/flags/']).toEqual([
                // This is the initial call to the flags endpoint on PostHog init.
                {
                    distinct_id: anonymousId,
                    person_properties: {},
                    groups: {},
                    token,
                },
            ])
        })

        resetRequests(token)

        // wait for flags callback
        await shortWait()

        // Person properties set here should also be sent to the flags endpoint.
        posthog.identify('test-id', {
            email: 'test@email.com',
        })

        await shortWait()

        await waitFor(() => {
            expect(getRequests(token)['/flags/']).toEqual([
                // Then we have another flags call triggered by the call to
                // `identify()`.
                {
                    $anon_distinct_id: anonymousId,
                    distinct_id: 'test-id',
                    person_properties: {
                        $initial__kx: null,
                        $initial_current_url: 'http://localhost/',
                        $initial_dclid: null,
                        $initial_epik: null,
                        $initial_fbclid: null,
                        $initial_gad_source: null,
                        $initial_gbraid: null,
                        $initial_gclid: null,
                        $initial_gclsrc: null,
                        $initial_host: 'localhost',
                        $initial_igshid: null,
                        $initial_irclid: null,
                        $initial_li_fat_id: null,
                        $initial_mc_cid: null,
                        $initial_msclkid: null,
                        $initial_pathname: '/',
                        $initial_qclid: null,
                        $initial_rdt_cid: null,
                        $initial_referrer: '$direct',
                        $initial_referring_domain: '$direct',
                        $initial_sccid: null,
                        $initial_ttclid: null,
                        $initial_twclid: null,
                        $initial_utm_campaign: null,
                        $initial_utm_content: null,
                        $initial_utm_medium: null,
                        $initial_utm_source: null,
                        $initial_utm_term: null,
                        $initial_wbraid: null,
                        email: 'test@email.com',
                    },
                    groups: {},
                    token,
                },
            ])
        })
    })

    test('person properties set in identify() with the same distinct_id are sent to flags', async () => {
        const posthog = await createPosthogInstance(token, { advanced_disable_flags: false })

        const anonymousId = posthog.get_distinct_id()

        await waitFor(() => {
            expect(getRequests(token)['/flags/']).toEqual([
                // This is the initial call to the flags endpoint on PostHog init.
                {
                    distinct_id: anonymousId,
                    person_properties: {},
                    groups: {},
                    token,
                },
            ])
        })

        resetRequests(token)

        // wait for flags callback
        await shortWait()

        // First we identify with a new distinct_id but with no properties set
        posthog.identify('test-id')

        // By this point we should have already called `/flags/` twice.
        await waitFor(() => {
            expect(getRequests(token)['/flags/']).toEqual([
                // Then we have another flags call triggered by the first call to
                // `identify()`.
                {
                    $anon_distinct_id: anonymousId,
                    distinct_id: 'test-id',
                    groups: {},
                    person_properties: {
                        $initial__kx: null,
                        $initial_current_url: 'http://localhost/',
                        $initial_dclid: null,
                        $initial_epik: null,
                        $initial_fbclid: null,
                        $initial_gad_source: null,
                        $initial_gbraid: null,
                        $initial_gclid: null,
                        $initial_gclsrc: null,
                        $initial_host: 'localhost',
                        $initial_igshid: null,
                        $initial_irclid: null,
                        $initial_li_fat_id: null,
                        $initial_mc_cid: null,
                        $initial_msclkid: null,
                        $initial_pathname: '/',
                        $initial_qclid: null,
                        $initial_rdt_cid: null,
                        $initial_referrer: '$direct',
                        $initial_referring_domain: '$direct',
                        $initial_sccid: null,
                        $initial_ttclid: null,
                        $initial_twclid: null,
                        $initial_utm_campaign: null,
                        $initial_utm_content: null,
                        $initial_utm_medium: null,
                        $initial_utm_source: null,
                        $initial_utm_term: null,
                        $initial_wbraid: null,
                    },
                    token,
                },
            ])
        })

        resetRequests(token)

        // Then we identify again, but with the same distinct_id and with some
        // properties set.
        posthog.identify('test-id', { email: 'test@email.com' })

        await waitFor(() => {
            expect(getRequests(token)['/flags/']).toEqual([
                {
                    distinct_id: 'test-id',
                    groups: {},
                    person_properties: {
                        $initial__kx: null,
                        $initial_current_url: 'http://localhost/',
                        $initial_dclid: null,
                        $initial_epik: null,
                        $initial_fbclid: null,
                        $initial_gad_source: null,
                        $initial_gbraid: null,
                        $initial_gclid: null,
                        $initial_gclsrc: null,
                        $initial_host: 'localhost',
                        $initial_igshid: null,
                        $initial_irclid: null,
                        $initial_li_fat_id: null,
                        $initial_mc_cid: null,
                        $initial_msclkid: null,
                        $initial_pathname: '/',
                        $initial_qclid: null,
                        $initial_rdt_cid: null,
                        $initial_referrer: '$direct',
                        $initial_referring_domain: '$direct',
                        $initial_sccid: null,
                        $initial_ttclid: null,
                        $initial_twclid: null,
                        $initial_utm_campaign: null,
                        $initial_utm_content: null,
                        $initial_utm_medium: null,
                        $initial_utm_source: null,
                        $initial_utm_term: null,
                        $initial_wbraid: null,
                        email: 'test@email.com',
                    },
                    token,
                },
            ])
        })
    })

    test('identify() triggers new request in queue after first request', async () => {
        const posthog = await createPosthogInstance(token, { advanced_disable_flags: false })

        const anonymousId = posthog.get_distinct_id()

        await waitFor(() => {
            expect(getRequests(token)['/flags/']).toEqual([
                // This is the initial call to the flags endpoint on PostHog init.
                {
                    distinct_id: anonymousId,
                    person_properties: {},
                    groups: {},
                    token,
                },
            ])
        })

        resetRequests(token)

        // don't wait for flags callback
        posthog.identify('test-id', {
            email: 'test2@email.com',
        })

        await waitFor(() => {
            expect(getRequests(token)['/flags/']).toEqual([])
        })

        // wait for flags callback
        await shortWait()

        // now second call should've fired
        await waitFor(() => {
            expect(getRequests(token)['/flags/']).toEqual([
                {
                    $anon_distinct_id: anonymousId,
                    distinct_id: 'test-id',
                    groups: {},
                    person_properties: {
                        $initial__kx: null,
                        $initial_current_url: 'http://localhost/',
                        $initial_dclid: null,
                        $initial_epik: null,
                        $initial_fbclid: null,
                        $initial_gad_source: null,
                        $initial_gbraid: null,
                        $initial_gclid: null,
                        $initial_gclsrc: null,
                        $initial_host: 'localhost',
                        $initial_igshid: null,
                        $initial_irclid: null,
                        $initial_li_fat_id: null,
                        $initial_mc_cid: null,
                        $initial_msclkid: null,
                        $initial_pathname: '/',
                        $initial_qclid: null,
                        $initial_rdt_cid: null,
                        $initial_referrer: '$direct',
                        $initial_referring_domain: '$direct',
                        $initial_sccid: null,
                        $initial_ttclid: null,
                        $initial_twclid: null,
                        $initial_utm_campaign: null,
                        $initial_utm_content: null,
                        $initial_utm_medium: null,
                        $initial_utm_source: null,
                        $initial_utm_term: null,
                        $initial_wbraid: null,
                        email: 'test2@email.com',
                    },
                    token,
                },
            ])
        })
    })

    test('identify() does not trigger new request in queue after first request for loaded callback', async () => {
        await createPosthogInstance(token, {
            advanced_disable_flags: false,
            bootstrap: { distinctID: 'anon-id' },
            loaded: (ph) => {
                ph.identify('test-id', { email: 'test3@email.com' })
                ph.group('playlist', 'id:77', { length: 8 })
            },
        })

        await waitFor(() => {
            expect(getRequests(token)['/flags/']).toEqual([
                // This is the initial call to the flags endpoint on PostHog init, with all info added from `loaded`.
                {
                    $anon_distinct_id: 'anon-id',
                    distinct_id: 'test-id',
                    groups: { playlist: 'id:77' },
                    person_properties: {
                        $initial__kx: null,
                        $initial_current_url: 'http://localhost/',
                        $initial_dclid: null,
                        $initial_epik: null,
                        $initial_fbclid: null,
                        $initial_gad_source: null,
                        $initial_gbraid: null,
                        $initial_gclid: null,
                        $initial_gclsrc: null,
                        $initial_host: 'localhost',
                        $initial_igshid: null,
                        $initial_irclid: null,
                        $initial_li_fat_id: null,
                        $initial_mc_cid: null,
                        $initial_msclkid: null,
                        $initial_pathname: '/',
                        $initial_qclid: null,
                        $initial_rdt_cid: null,
                        $initial_referrer: '$direct',
                        $initial_referring_domain: '$direct',
                        $initial_sccid: null,
                        $initial_ttclid: null,
                        $initial_twclid: null,
                        $initial_utm_campaign: null,
                        $initial_utm_content: null,
                        $initial_utm_medium: null,
                        $initial_utm_source: null,
                        $initial_utm_term: null,
                        $initial_wbraid: null,
                        email: 'test3@email.com',
                    },
                    group_properties: {
                        playlist: {
                            length: 8,
                        },
                    },
                    token,
                },
            ])
        })
    })
})

describe('feature flags v2', () => {
    let token: string

    beforeEach(() => {
        token = uuidv7()
    })

    it('should call flags endpoint when eligible', async () => {
        const posthog = await createPosthogInstance(token, {
            __preview_flags_v2: true,
            __preview_remote_config: true,
            advanced_disable_flags: false,
        })

        await waitFor(() => {
            expect(getRequests(token)['/flags/']).toEqual([
                expect.objectContaining({
                    token,
                    distinct_id: posthog.get_distinct_id(),
                }),
            ])
        })
    })

    it('should call flags endpoint when not eligible', async () => {
        const posthog = await createPosthogInstance(token, {
            __preview_flags_v2: false,
            __preview_remote_config: true,
            advanced_disable_flags: false,
        })

        await waitFor(() => {
            expect(getRequests(token)['/flags/']).toEqual([
                expect.objectContaining({
                    token,
                    distinct_id: posthog.get_distinct_id(),
                }),
            ])
        })
    })

    // TODO: eventually I want to deprecate these behavior, but for now I want to make sure we don't break people
    it('should call flags endpoint when preview flags is enabled but remote config is disabled', async () => {
        const posthog = await createPosthogInstance(token, {
            __preview_flags_v2: true,
            __preview_remote_config: false,
            advanced_disable_flags: false,
        })

        await waitFor(() => {
            expect(getRequests(token)['/flags/']).toEqual([
                expect.objectContaining({
                    token,
                    distinct_id: posthog.get_distinct_id(),
                }),
            ])
        })
    })
})
