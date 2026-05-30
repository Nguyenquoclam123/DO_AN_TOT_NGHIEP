import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingService implements OnModuleInit {
    constructor(
        @InjectRepository(Setting)
        private readonly settingRepository: Repository<Setting>,
    ) { }

    async onModuleInit() {
        // Initialize default settings if they don't exist
        const defaults = [
            { key: 'ai_model', value: 'gemini-1.5-pro', description: 'Active AI model for analysis' },
            { key: 'ai_temperature', value: '0.3', description: 'Creativity level of AI' },
            { key: 'ai_system_prompt', value: 'You are Nexus Talent AI, a high-performance recruitment orchestration agent.', description: 'Global AI instructions' }
        ];

        for (const def of defaults) {
            const exists = await this.settingRepository.findOne({ where: { key: def.key } });
            if (!exists) {
                await this.settingRepository.save(this.settingRepository.create(def));
            }
        }
    }

    async findAll() {
        const settings = await this.settingRepository.find();
        return settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
    }

    async get(key: string): Promise<string | null> {
        const setting = await this.settingRepository.findOne({ where: { key } });
        return setting ? setting.value : null;
    }

    async set(key: string, value: string) {
        let setting = await this.settingRepository.findOne({ where: { key } });
        if (setting) {
            setting.value = value;
        } else {
            setting = this.settingRepository.create({ key, value });
        }
        return await this.settingRepository.save(setting);
    }
}
