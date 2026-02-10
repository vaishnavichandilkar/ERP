export declare class GlobalResponseDto<T> {
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
    constructor(statusCode: number, message: string, data: T);
}
