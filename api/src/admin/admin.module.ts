import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminCoursesService } from './admin-courses.service';
import { AdminCoursesController } from './admin-courses.controller';
import { AdminTeachersService } from './admin-teachers.service';
import { AdminTeachersController } from './admin-teachers.controller';

@Module({
  controllers: [
    AdminController,
    AdminCoursesController,
    AdminTeachersController,
  ],
  providers: [AdminService, AdminCoursesService, AdminTeachersService],
  exports: [AdminService, AdminCoursesService, AdminTeachersService],
})
export class AdminModule {}
