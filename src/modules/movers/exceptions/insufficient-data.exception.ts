import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientDataException extends HttpException {
  constructor(field = 'period') {
    super(
      {
        error_code: 'INSUFFICIENT_DATA',
        message:
          'แจ้งเตือนระบบขัดข้อง / ข้อมูลไม่เพียงพอสำหรับการคำนวณ Top Movers',
        details: { field },
      },
      HttpStatus.INTERNAL_SERVER_ERROR, // 500
    );
  }
}
