import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('profile_work')
export class ProfileWork {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Profile, profile => profile.workEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column()
  company: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'start_date', nullable: true })
  startDate: string;

  @Column({ name: 'end_date', nullable: true })
  endDate: string;

  @Column({ name: 'is_current', default: false })
  isCurrent: boolean;
}
