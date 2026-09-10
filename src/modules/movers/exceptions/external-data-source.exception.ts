import { HttpException, HttpStatus } from '@nestjs/common';

export class ExternalDataSourceException extends HttpException {
  constructor() {
    super(
      {
        error_code: 'EXTERNAL_DATA_SOURCE_ERROR',
        message: 'แจ้งเตือนระบบขัดข้อง / ไม่สามารถดึงข้อมูลจาก Massive API ได้',
      },
      HttpStatus.BAD_GATEWAY, // 502
    );
  }
}
