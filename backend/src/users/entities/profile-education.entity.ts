import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_education')
export class ProfileEducation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Profile, profile => profile.educationEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column()
  school: string;

  @Column({ nullable: true })
  degree: string;

  @Column({ name: 'field_of_study', nullable: true })
  fieldOfStudy: string;

  @Column({ name: 'start_year', nullable: true })
  startYear: string;

  @Column({ name: 'end_year', nullable: true })
  endYear: string;
}
