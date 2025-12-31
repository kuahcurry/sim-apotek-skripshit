<?php

use Illuminate\Support\Facades\Broadcast;

/**
 * Register broadcast channels for the application.
 */

// Public pharmacy channel - for all authenticated users
Broadcast::channel('pharmacy', function ($user) {
    return $user !== null;
});

// Public notifications channel
Broadcast::channel('notifications', function ($user) {
    return $user !== null;
});

// Private user notifications channel
Broadcast::channel('notifications.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Private user channel
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
