#!/usr/bin/perl
use strict;
use warnings;
use IO::Socket::INET;
use File::Basename;

my $root = "C:/Users/Stephi/webside waldmomente";
my $port = $ENV{PORT} // 8080;

my %types = (
    '.html' => 'text/html; charset=utf-8',
    '.css'  => 'text/css',
    '.js'   => 'application/javascript',
    '.jpg'  => 'image/jpeg',
    '.jpeg' => 'image/jpeg',
    '.png'  => 'image/png',
    '.gif'  => 'image/gif',
    '.svg'  => 'image/svg+xml',
    '.ico'  => 'image/x-icon',
);

my $server = IO::Socket::INET->new(
    LocalPort => $port,
    Proto     => 'tcp',
    Listen    => 10,
    ReuseAddr => 1,
) or die "Cannot bind to port $port: $!";

print "Server running on http://localhost:$port/\n";
$| = 1;

while (my $client = $server->accept()) {
    my $request = '';
    while (my $line = <$client>) {
        $request .= $line;
        last if $line =~ /^\r?\n$/;
    }

    my ($path) = $request =~ /^GET ([^\s]+)/;
    $path //= '/';
    $path = '/' if $path eq '';
    $path = '/index.html' if $path eq '/';
    $path =~ s/\?.*$//;

    my $file = $root . $path;
    $file =~ s|/|\\|g;

    if (-f $file) {
        open(my $fh, '<:raw', $file) or do {
            print $client "HTTP/1.1 500 Error\r\n\r\n";
            close $client;
            next;
        };
        my @stat = stat($fh);
        my $size = $stat[7];
        my ($ext) = $file =~ /(\.[^.]+)$/;
        $ext = lc($ext // '');
        my $ctype = $types{$ext} // 'application/octet-stream';

        print $client "HTTP/1.1 200 OK\r\n";
        print $client "Content-Type: $ctype\r\n";
        print $client "Content-Length: $size\r\n";
        print $client "Connection: close\r\n";
        print $client "\r\n";

        my $buf;
        while (read($fh, $buf, 8192)) {
            print $client $buf;
        }
        close $fh;
    } else {
        my $body = "404 Not Found: $path";
        print $client "HTTP/1.1 404 Not Found\r\n";
        print $client "Content-Length: " . length($body) . "\r\n";
        print $client "\r\n$body";
    }

    close $client;
}
