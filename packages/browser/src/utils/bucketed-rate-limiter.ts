import { clampToRange } from './number-utils'

export class BucketedRateLimiter<T extends string | number> {
    private _bucketSize
    private _refillRate
    private _refillInterval
    private _onBucketRateLimited?: (key: T) => void

    private _buckets: Record<string, number> = {}

    constructor(
        private readonly _options: {
            bucketSize: number
            refillRate: number
            refillInterval: number
            _onBucketRateLimited?: (key: T) => void
        }
    ) {
        this._onBucketRateLimited = this._options._onBucketRateLimited
        this._bucketSize = clampToRange(this._options.bucketSize, 0, 100, 'rate limiter bucket size')
        this._refillRate = clampToRange(
            this._options.refillRate,
            0,
            this._bucketSize, // never refill more than bucket size
            'rate limiter refill rate'
        )
        this._refillInterval = clampToRange(
            this._options.refillInterval,
            0,
            86400000, // one day in milliseconds
            'rate limiter refill interval'
        )
        setInterval(() => {
            this._refillBuckets()
        }, this._refillInterval)
    }

    private _refillBuckets = () => {
        Object.keys(this._buckets).forEach((key) => {
            const newTokens = this._getBucket(key) + this._refillRate

            if (newTokens >= this._bucketSize) {
                delete this._buckets[key]
            } else {
                this._setBucket(key, newTokens)
            }
        })
    }

    private _getBucket = (key: T | string) => {
        return this._buckets[String(key)]
    }
    private _setBucket = (key: T | string, value: number) => {
        this._buckets[String(key)] = value
    }

    public consumeRateLimit = (key: T) => {
        let tokens = this._getBucket(key) ?? this._bucketSize
        tokens = Math.max(tokens - 1, 0)

        if (tokens === 0) {
            return true
        }

        this._setBucket(key, tokens)

        const hasReachedZero = tokens === 0

        if (hasReachedZero) {
            this._onBucketRateLimited?.(key)
        }

        return hasReachedZero
    }
}
