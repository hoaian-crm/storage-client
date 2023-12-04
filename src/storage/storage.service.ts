import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc, Transport } from '@nestjs/microservices';
import { Storage, observableHandler } from 'crm-prototypes';

@Injectable()
export class StorageService implements OnModuleInit {
  private storageController: Storage.IStorageController;
  @Client({
    transport: Transport.GRPC,
    options: {
      url: process.env.STORAGE_GRPC,
      package: 'storage',
      protoPath: 'node_modules/crm-prototypes/interfaces/storage.proto',
      maxReceiveMessageLength: 1024 * 1024 * 1024,
      maxSendMessageLength: 1024 * 1024 * 1024,
    },
  })
  private client: ClientGrpc;
  constructor() {}
  async onModuleInit() {
    this.storageController =
      this.client.getService<Storage.IStorageController>('IStorageController');
  }

  async upload(
    file: Express.Multer.File,
    path: string,
  ): Promise<Storage.PutFileResponse> {
    return observableHandler(
      await this.storageController.Put({
        content: file.buffer,
        destination: path,
        filename: file.originalname,
      }),
    );
  }

  async readFile(request: Storage.ReadFile) {
    return observableHandler<Storage.ReadFileResponse>(
      await this.storageController.Read(request),
    );
  }

  async healthCheck() {
    return await this.storageController.HealthCheck({
      message: 'You are healthy',
    });
  }
}
