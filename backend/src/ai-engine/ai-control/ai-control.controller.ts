import { Controller } from '@nestjs/common';
import { AiControlService } from './ai-control.service';

@Controller('ai-control')
export class AiControlController {
    constructor(private readonly aiControlService: AiControlService) { }
}
