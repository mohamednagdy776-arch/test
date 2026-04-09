# Module 11: Events

## Overview

The Events module provides event creation and management functionality with RSVP capabilities for the social platform.

## Entities

### Event (`entities/event.entity.ts`)
- `id` (UUID): Unique identifier
- `title`: Event title
- `description`: Event details/description
- `startDate`: Event start date/time
- `endDate`: Event end date/time (optional)
- `location`: Event location
- `privacy`: Event privacy setting (`public` | `private`)
- `createdBy`: User who created the event
- `createdAt`: Timestamp of creation

### EventRSVP (`entities/event-rsvp.entity.ts`)
- `id` (UUID): Unique identifier
- `event`: Associated event
- `user`: User who RSVP'd
- `status`: RSVP status (`going` | `interested` | `not_going`)
- `rsvpedAt`: Timestamp of RSVP

## DTOs

### CreateEventDto (`dto/create-event.dto.ts`)
- `title` (required): Event title
- `description` (optional): Event details
- `startDate` (required): Event start date/time (ISO string)
- `endDate` (optional): Event end date/time (ISO string)
- `location` (optional): Event location
- `privacy` (optional): `public` or `private` (defaults to `public`)

### UpdateRsvpDto
- `status` (required): `going` | `interested` | `not_going`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/events` | Create a new event |
| GET | `/events` | List upcoming events (paginated) |
| GET | `/events/my` | Get user's RSVP'd events |
| GET | `/events/:id` | Get event details with RSVP counts |
| POST | `/events/:id/rsvp` | Update RSVP status for an event |

## Features

### Event Creation
- Create events with title, description, date/time, and location
- Set privacy to `public` or `private`
- Creator is automatically marked as "going"

### RSVP System
- **Going**: User plans to attend
- **Interested**: User is interested but not committed
- **Not Going**: User explicitly declines
- Users can update their RSVP status at any time

### Guest List
- Public events: Guest list visible to all users
- Private events: Guest list only visible to RSVP'd guests
- RSVP counts (going/interested/not going) included in event response

### Event Notifications
- Service layer ready for notification integration
- RSVP updates trigger event status changes

## Service Methods

| Method | Description |
|--------|-------------|
| `create(dto, user)` | Create a new event |
| `findAll(page, limit)` | Get paginated upcoming events |
| `findOne(eventId, userId)` | Get event with RSVP counts and user's response |
| `rsvp(eventId, user, status)` | Update user's RSVP for an event |
| `getMyEvents(userId)` | Get all events user has RSVP'd to |
| `getRsvpCounts(eventId)` | Get counts for each RSVP status |

## Authentication

All endpoints require JWT authentication via Passport JWT strategy.