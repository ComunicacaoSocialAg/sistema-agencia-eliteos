import struct
import sys

def get_mp4_resolution(filepath):
    with open(filepath, 'rb') as f:
        data = f.read()
        
    # Search for 'tkhd' (track header atom)
    idx = data.find(b'tkhd')
    if idx == -1:
        print("tkhd atom not found")
        return None
        
    # Read width and height from tkhd atom
    # The tkhd atom starts with standard box headers (4 bytes size, 4 bytes type)
    # Inside tkhd:
    # 1 byte version
    # 3 bytes flags
    # If version == 1, 64-bit times are used, else 32-bit.
    # Standard version is 0.
    version = data[idx + 4]
    
    # Skip to width and height fields:
    # Version 0:
    # 4 bytes creation time
    # 4 bytes modification time
    # 4 bytes track ID
    # 4 bytes reserved
    # 4 bytes duration
    # 8 bytes reserved
    # 2 bytes layer
    # 2 bytes alternate group
    # 2 bytes volume
    # 2 bytes reserved
    # 36 bytes matrix structure
    # 4 bytes width (fixed point 16.16)
    # 4 bytes height (fixed point 16.16)
    
    if version == 0:
        offset = idx + 8 + 4 + 4 + 4 + 4 + 4 + 8 + 2 + 2 + 2 + 2 + 36
    else:
        # Version 1 (64-bit)
        offset = idx + 8 + 8 + 8 + 4 + 4 + 8 + 8 + 2 + 2 + 2 + 2 + 36
        
    w_int, w_frac = struct.unpack('>HH', data[offset:offset+4])
    h_int, h_frac = struct.unpack('>HH', data[offset+4:offset+8])
    
    return w_int, h_int

if __name__ == '__main__':
    path = "/Users/bruno/Documents/Dubola Alimentos/site/hero todas/hero todas.mp4"
    res = get_mp4_resolution(path)
    if res:
        print(f"Resolution: {res[0]}x{res[1]}")
